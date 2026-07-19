import { createCheck, findLatestCheck } from "../models/check-model.js";
import { listAllMonitors } from "../models/monitor-model.js";
import { pollMonitor } from "./poller.js";

const SCHEDULER_INTERVAL = 5000;

let timer = null;

export function startScheduler() {
  if (timer) {
    return;
  }

  timer = setInterval(async () => {
    try {
      await schedulerTick();
    } catch (err) {
      console.error("Scheduler tick failed: ", err);
    }
  }, SCHEDULER_INTERVAL);

  console.log("Scheduler started!!");
}

export function stopScheduler() {
  if (!timer) {
    return;
  }

  clearInterval(timer);

  timer = null;

  console.log("Scheduler stopped!!");
}

async function schedulerTick() {
  const monitors = await listAllMonitors();

  // console.log(`Checking ${monitors.length} monitor(s)...`);

  for (const monitor of monitors) {
    
    const latest = await findLatestCheck(monitor.id);

    const lastTime = latest
      ? new Date(latest.checked_at)
      : new Date(monitor.created_at);

    const elapsed = Date.now() - lastTime.getTime();

    if (elapsed < monitor.interval_seconds * 1000) {
      continue;
    }

    // console.log(`${monitor.name} is due`);
    const result = await pollMonitor(monitor);

    await createCheck(monitor.id, result);

    console.log(`${monitor.name}: ${result.ok ? "UP" : "DOWN"}`);
  }
}
