import dotenv from 'dotenv';

dotenv.config({
    path: process.env.NODE_ENV === "test" 
        ? ".env.test"
        : ".env"
});

export const config = {
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 3000,
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    logLevel: process.env.LOG_LEVEL || "info"
};