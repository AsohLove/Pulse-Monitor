import pg from "pg";
import dotenv from 'dotenv';

dotenv.config({
    path: process.env.NODE_ENV === "test" 
        ? ".env.test"
        : ".env"
})

export const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});