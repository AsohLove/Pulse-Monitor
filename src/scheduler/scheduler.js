import { listAllMonitors } from "../models/monitor-model.js";

const COUNT_INTERVAL = 5000;

let timer = null;

export function startScheduler(){

    if (timer) {
        return;
    }

    timer = setInterval(async () => {

        try {
            await schedulerTick();
        } catch (err) {

            console.error("Scheduler tick failed: ", err);
            
            
        }
    }, COUNT_INTERVAL );

    console.log("Scheduler started!!");
    
}

export function stopScheduler() {

    if (!timer) {
        return
    }

    clearInterval(timer);

    timer = null;

    console.log("Scheduler stopped!!");
    
}

async function schedulerTick() {

    const monitors = await listAllMonitors();

    console.log(`Checking ${monitors.length} monitor(s)...`);
    
}