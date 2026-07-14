import { pool } from "../db/db.js";

export async function create(email, hashedPassword) {
    const { rows } = await pool.query(
        `
        INSERT INTO users
            (email, password_hash)
        VALUES 
            ($1, $2)
        RETURNING id, email, created_at

        `, [email, hashedPassword]
    );

    return rows[0];
}

export async function findUserByEmail(email){
    const { rows } = await pool.query(
        `
        SELECT * FROM users 
        WHERE email = $1
        
        `, [email]
    );

    return rows[0];
}

export async function findUserById(id) {
    const { rows } = await pool.query(
        `
        SELECT * 
        FROM users
        WHERE id = $1

        `, [id]
    );

    return rows[0];
}