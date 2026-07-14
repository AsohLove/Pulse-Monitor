import { readFileSync } from "node:fs";
import { pool } from "../src/db/db.js";

const seed = readFileSync(
    new URL("../db/seed.sql", import.meta.url),
    "utf8"
);

await pool.query(seed);

console.log("Database seeded successfully!!!!.");

await pool.end();