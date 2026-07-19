import { pool } from '../db/db.js'

export async function findLatestCheck(monitorId) {

    const { rows } = await pool.query(
        `
        SELECT *
        FROM checks
        WHERE monitor_id = $1
        ORDER BY checked_at DESC
        LIMIT 1;

        `, [monitorId]
    );

    return rows[0];
}

export async function createCheck(monitorId, result){
    
    const { rows } = await pool.query(
        `
        INSERT INTO checks
            (monitor_id, ok, status_code, latency_ms, error)
        VALUES
            ($1, $2, $3, $4, $5)
        RETURNING *;
        
        `, [monitorId, result.ok, result.status_code, result.latency_ms, result.error]
    )

    return rows[0];
}