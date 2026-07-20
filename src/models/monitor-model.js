import { pool } from '../db/db.js'

export async function createMonitor(ownerId, name, url, intervalSeconds, expectedStatus) {
    const {rows } = await pool.query(
        `
        INSERT into monitors 
            ( owner_id, name, url, interval_seconds, expected_status )
        VALUES
            ( $1, $2, $3, $4, $5)
        RETURNING *;

        `, [ownerId, name, url, intervalSeconds, expectedStatus]
    )

    return rows[0];
}

export async function findSingleMonitorById(ownerId, monitorId) {
    const { rows } = await pool.query(
        `
        SELECT * 
        FROM monitors
        WHERE id = $1
            AND owner_id = $2
        `, [monitorId, ownerId]
    )

    return rows[0];
}

export async function listAllMonitors(ownerId){
    const { rows } = await pool.query(
        `
        SELECT * 
        FROM monitors 
        WHERE owner_id = $1
        ORDER BY id;

        `, [ownerId]
    )

    return rows;

}

export async function deleteMonitor(ownerId, monitorId){
    const result = await pool.query(
        `
        DELETE FROM monitors
        WHERE id = $1
            AND owner_id = $2;
        `, [monitorId, ownerId]
    )

    return result.rowCount;
}

export async function updateMonitor(ownerId, monitorId, body){
      const allowed = [
        "name",
        "url",
        "interval_seconds",
        "expected_status",
        "is_active"
    ];
    
    const updates = [];

    const values = [];

    for (const [key, value] of Object.entries(body)){

        if (!allowed.includes(key)) continue;

        values.push(value);
        updates.push(`${key} = $${values.length}`);
    }

    values.push(monitorId)
    values.push(ownerId)

    if (updates.length === 0) {
        return null;
    }

    const  query = `
    UPDATE monitors 

    SET ${updates.join(", ")}

    WHERE id = $${values.length - 1}

    AND owner_id = $${values.length}

    RETURNING *;

    `;

    const { rows } = await pool.query(query, values)

    return rows[0];
}

export async function getMonitorUptime(monitorId, windowHours){
    
    const { rows } = await pool.query(
        `
        SELECT COUNT(*) FILTER (where ok = true) AS successful,
               COUNT(*) AS total,
               AVG(latency_ms) AS average_latency,
               percentile_cont(0.95) WITHIN GROUP
                    (ORDER BY latency_ms) AS p95_latency
        FROM checks
        WHERE monitor_id = $1
        AND checked_at >= NOW() - ($2 * INTERVAL '1 hour');

        `, [monitorId, windowHours]
    );

    return rows[0];
}


