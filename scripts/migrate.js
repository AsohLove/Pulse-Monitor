import { readFileSync } from 'node:fs'
import { pool } from '../src/db/db.js';

const schema = readFileSync(
    new URL("../db/schemas.sql", import.meta.url), "utf8"
);

await pool.query(schema);

console.log("Database migrated successfully!!!");

await pool.end();
