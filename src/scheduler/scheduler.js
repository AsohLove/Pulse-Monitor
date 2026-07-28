import { logger } from '../../lib/logger.js';
import { findLatestCheck } from '../models/check-model.js';
import { listAllActiveMonitors } from '../models/monitor-model.js';
import { recordCheck } from '../services/check-service.js';
import { pollMonitor } from './poller.js';

const SCHEDULER_INTERVAL = process.env.NODE_ENV === 'test' ? 1000 : 5000;

let timer = null;

export function startScheduler() {
  if (timer) {
    return;
  }

  timer = setInterval(async () => {
    try {
      await schedulerTick();
    } catch (err) {
      logger.error('Scheduler tick failed: ', err);
    }
  }, SCHEDULER_INTERVAL);

  logger.info('Scheduler started!!');
}

export function stopScheduler() {
  if (!timer) {
    return;
  }

  clearInterval(timer);

  timer = null;

  logger.info('Scheduler stopped!!');
}

async function schedulerTick() {
  const monitors = await listAllActiveMonitors();

  for (const monitor of monitors) {
    const latest = await findLatestCheck(monitor.id);

    const lastTime = latest
      ? new Date(latest.checked_at)
      : new Date(monitor.created_at);

    const elapsed = Date.now() - lastTime.getTime();

    if (elapsed < monitor.interval_seconds * 1000) {
      continue;
    }

    const result = await pollMonitor(monitor);

    await recordCheck(monitor.id, result);

    logger.info(`${monitor.name}: ${result.ok ? 'UP' : 'DOWN'}`);
  }
}
