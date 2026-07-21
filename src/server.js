import { createApp } from './app.js';
import { createServer } from 'node:http';
import { config } from './config.js';
import { startScheduler, stopScheduler } from './scheduler/scheduler.js';
import { pool } from '../src/db/db.js';
import { logger } from '../lib/logger.js';

const app = createApp();
const server = createServer(app);

server.listen(config.port, () => {
  logger.info(`Pulse monitor running on http://localhost:${config.port}`);
  startScheduler();
});

let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`Received ${signal}. Shutting down gracefully...`);

  stopScheduler();

  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      await pool.end();
      logger.info('Database pool closed.');
      process.exit(0);
    } catch (err) {
      logger.error(err, 'Error while closing database pool');
      process.exit(1);
    }
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
