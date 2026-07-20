import { pool } from '../db/db.js'

export async function findLatestCheck(client, monitorId) {

    const { rows } = await client.query(
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

export async function createCheck(client, monitorId, result){
    
    const { rows } = await client.query(
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

export async function getMonitorChecks(monitorId, after = 0, limit = 10){

    const { rows } = await pool.query(
        `
        SELECT *
        FROM checks
        WHERE monitor_id = $1
            AND id > $2
        ORDER BY id
        LIMIT $3;
        `, [monitorId, after, limit]
    );

    return rows;
}


export async function streamChecksCsv(monitorId) {

    const { rows } = await pool.query(
        `
        SELECT checked_at, ok, status_code, latency_ms, error
        FROM checks
        WHERE monitor_id = $1
        ORDER BY checked_at;

        `, [monitorId]
    );

    return rows;
}