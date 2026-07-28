import { pool } from '../src/db/db.js';

try {
  await pool.query(`
        TRUNCATE users, monitors, checks, incidents RESTART IDENTITY CASCADE;
        `);

  console.log('Database Reset Successfully!!!');
} finally {
  await pool.end();
}
