import { pool } from '../db/db.js'

export async function findOpenIncident(client, monitorId){

    const { rows } = await client.query(
        `
        SELECT *
        FROM incidents
        WHERE monitor_id = $1
        AND resolved_at IS NULL
        LIMIT 1;

        `, [monitorId]
    );

    return rows[0];
}

export async function openIncident(client, monitorId, cause){

    const { rows } = await client.query(
        `
        INSERT INTO incidents
            (monitor_id, cause) 
        VALUES 
            ($1, $2)
        
        `, [monitorId, cause]
    );

    return rows[0];
}

export async function resolveIncident(client, incidentId){

    const { rows } = await client.query(
        `
        UPDATE incidents
        SET resolved_at = NOW()
        WHERE id = $1;
        
        `, [incidentId]
    )
}

export async function listIncidents(){

    const { rows } = await pool.query(
        `
        SELECT *
        FROM incidents
        order by started_at DESC;

        `
    );
    
    return rows;
}

export async function listMonitorIncidents(monitorId){

    const { rows } = await pool.query(
        `
        SELECT *
        from incidents
        WHERE monitor_id = $1
        ORDER BY started_at DESC

        `, [monitorId]
    );

    return rows;
}