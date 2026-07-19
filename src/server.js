import { createApp } from "./app.js";
import { createServer } from 'node:http'
import{ config } from './config.js'
import { startScheduler } from "./scheduler/scheduler.js";

const app = createApp()

const server = createServer(app)


server.listen(config.port, () => {
    console.log(`Pulse monitor running on http://localhost:${config.port}`);
    
    startScheduler();
})
