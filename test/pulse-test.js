import test from 'node:test';
import assert from 'node:assert/strict';

import { pool } from '../src/db/db.js';
import { createApp } from '../src/app.js';
import { startScheduler, stopScheduler } from '../src/scheduler/scheduler.js';

let server;
let baseUrl;

let token;
let secondToken;

let monitorId;

async function json(res) {
  return await res.json();
}

test.before(async () => {
  server = createApp().listen(0);

  startScheduler();

  baseUrl = `http://localhost:${server.address().port}`;
});

test.after(async () => {
  stopScheduler();

  server.close();

  await pool.end();
});

test('Health & Authentication', async (t) => {
  await t.test('GET /health returns OK', async () => {
    const res = await fetch(`${baseUrl}/health`);

    assert.equal(res.status, 200);

    const body = await json(res);

    assert.deepEqual(body, {
      status: 'OK',
    });
  });

  await t.test('POST /auth/register creates a user', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'love@example.com',
        password: 'password123',
      }),
    });

    assert.equal(res.status, 201);
  });

  await t.test('Duplicate registration returns 409', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'love@example.com',
        password: 'password123',
      }),
    });

    assert.equal(res.status, 409);
  });

  await t.test('POST /auth/login returns JWT', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'love@example.com',
        password: 'password123',
      }),
    });

    assert.equal(res.status, 200);

    const body = await json(res);

    token = body.data;

    assert.ok(token);
  });

  await t.test('Wrong password returns 401', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'love@example.com',
        password: 'wrongpassword',
      }),
    });

    assert.equal(res.status, 401);
  });
});

test('Monitor CRUD', async (t) => {
  await t.test('Create monitor', async () => {
    const res = await fetch(`${baseUrl}/monitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Google',
        url: 'https://google.com',
        interval_seconds: 60,
        expected_status: 200,
      }),
    });

    assert.equal(res.status, 201);

    const body = await json(res);

    monitorId = body.data.id;

    assert.ok(monitorId);
    assert.equal(body.data.name, 'Google');
    assert.equal(body.data.url, 'https://google.com');
    assert.equal(body.data.interval_seconds, 60);
    assert.equal(body.data.expected_status, 200);
    assert.equal(body.data.is_active, true);
  });

  await t.test('Get single monitor', async () => {
    const res = await fetch(`${baseUrl}/monitors/${monitorId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(res.status, 200);

    const body = await json(res);

    assert.equal(body.data.id, monitorId);
    assert.equal(body.data.name, 'Google');
    assert.equal(body.data.url, 'https://google.com');
  });

  await t.test('List monitors', async () => {
    const res = await fetch(`${baseUrl}/monitors`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(res.status, 200);

    const body = await json(res);

    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 1);
  });

  await t.test('Update monitor', async () => {
    const res = await fetch(`${baseUrl}/monitors/${monitorId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        interval_seconds: 120,
        is_active: false,
      }),
    });

    assert.equal(res.status, 200);

    const body = await json(res);

    assert.equal(body.data.interval_seconds, 120);
    assert.equal(body.data.is_active, false);
  });
});

let secondMonitorId;

test('Ownership', async (t) => {
  await t.test('Register second operator', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'alice@example.com',
        password: 'password123',
      }),
    });

    assert.equal(res.status, 201);
  });

  await t.test('Login second operator', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'alice@example.com',
        password: 'password123',
      }),
    });

    assert.equal(res.status, 200);

    const body = await json(res);

    secondToken = body.data;

    assert.ok(secondToken);
  });

  await t.test('Second operator creates monitor', async () => {
    const res = await fetch(`${baseUrl}/monitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secondToken}`,
      },
      body: JSON.stringify({
        name: 'GitHub',
        url: 'https://github.com',
        interval_seconds: 60,
        expected_status: 200,
      }),
    });

    assert.equal(res.status, 201);

    const body = await json(res);

    secondMonitorId = body.data.id;
  });

  await t.test(
    'First operator cannot access second operator monitor',
    async () => {
      const res = await fetch(`${baseUrl}/monitors/${secondMonitorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      assert.equal(res.status, 404);
    },
  );

  await t.test(
    'Second operator cannot delete first operator monitor',
    async () => {
      const res = await fetch(`${baseUrl}/monitors/${monitorId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${secondToken}`,
        },
      });

      assert.equal(res.status, 404);
    },
  );
});

test('Validation', async (t) => {
  await t.test('Reject invalid URL', async () => {
    const res = await fetch(`${baseUrl}/monitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Broken',
        url: 'not-a-url',
        interval_seconds: 60,
        expected_status: 200,
      }),
    });

    assert.equal(res.status, 400);
  });

  await t.test('Reject invalid interval', async () => {
    const res = await fetch(`${baseUrl}/monitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Broken',
        url: 'https://google.com',
        interval_seconds: 5,
        expected_status: 200,
      }),
    });

    assert.equal(res.status, 400);
  });

  await t.test('Reject missing name', async () => {
    const res = await fetch(`${baseUrl}/monitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: 'https://google.com',
        interval_seconds: 60,
        expected_status: 200,
      }),
    });

    assert.equal(res.status, 400);
  });

  await t.test('Reject missing url', async () => {
    const res = await fetch(`${baseUrl}/monitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Google',
        interval_seconds: 60,
        expected_status: 200,
      }),
    });

    assert.equal(res.status, 400);
  });
});

test('Security', async (t) => {
  await t.test('SQL injection login is harmless', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: "' OR 1=1 --",
        password: 'anything',
      }),
    });

    // assert.notEqual(res.status, 500);
    // assert.notEqual(res.status, 200);

    assert.ok(res.status === 400 || res.status === 401);
  });

  await t.test('SQL injection monitor lookup is harmless', async () => {
    const res = await fetch(`${baseUrl}/monitors/' OR 1=1 --`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.notEqual(res.status, 500);
  });
});

test('Cleanup', async (t) => {
  await t.test('First operator deletes own monitor', async () => {
    const res = await fetch(`${baseUrl}/monitors/${monitorId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(res.status, 204);
  });

  await t.test('Second operator deletes own monitor', async () => {
    const res = await fetch(`${baseUrl}/monitors/${secondMonitorId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${secondToken}`,
      },
    });

    assert.equal(res.status, 204);
  });
});

test('Scheduler & Incident', async (t) => {
  let brokenMonitorId;

  await t.test('Create failing monitor', async () => {
    const res = await fetch(`${baseUrl}/monitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Broken',
        url: 'http://localhost:9999',
        interval_seconds: 10,
        expected_status: 200,
      }),
    });

    const body = await json(res);

    brokenMonitorId = body.data.id;

    assert.equal(res.status, 201);
  });

  await t.test('Scheduler records failed check', async () => {
    await new Promise((resolve) => setTimeout(resolve, 12000));

    const res = await fetch(`${baseUrl}/monitors/${brokenMonitorId}/checks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(res.status, 200);

    const body = await json(res);

    assert.ok(body.data.length > 0);

    assert.equal(body.data[0].ok, false);

    assert.equal(body.data[0].status_code, null);

    assert.ok(body.data[0].error);
  });

  await t.test('Incident opened', async () => {
    const res = await fetch(
      `${baseUrl}/monitors/${brokenMonitorId}/incidents`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const body = await json(res);

    assert.equal(res.status, 200);

    assert.ok(body.data.length >= 1);
  });
});

test('Public Status', async () => {
  const res = await fetch(`${baseUrl}/status`);

  assert.equal(res.status, 200);

  const body = await json(res);

  assert.ok(Array.isArray(body.monitors));
});
