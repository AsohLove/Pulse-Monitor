import { pool } from '../db/db.js'

export async function listActiveMonitors(){

    const { rows } = await pool.query(
        `
        SELECT *
        FROM monitors
        WHERE is_active = true
        ORDER BY id;

        `
    );

    return rows;
}

export async function listOpenIncidents(){

    const { rows } = await pool.query(
        `
        SELECT * 
        FROM incidents
        WHERE resolve_at IS NULL
        ORDER BY started_at;

        `
    );

    return rows;
}