import { createApp } from "./app.js";
import { createServer } from 'node:http'
import{ config } from './config.js'
import { startScheduler, stopScheduler } from "./scheduler/scheduler.js";

import { pool } from "../src/db/db.js"
import { logger } from "../lib/logger.js";

const app = createApp()

const server = createServer(app)


server.listen(config.port, () => {
    logger.info(`Pulse monitor running on http://localhost:${config.port}`);
    
    startScheduler();
})


process.on("SIGINT", () => {

    stopScheduler();

    server.close(async ()  => {
        await pool.end();
        process.exit(0)
    });

});

process.on("SIGTERM", () => {

    stopScheduler();

    server.close(async ()  => {
        await pool.end();
        process.exit(0)
    });
    
});