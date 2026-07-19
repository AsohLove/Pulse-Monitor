import { config } from "../config.js";

export async function pollMonitor(monitor){

    const start = performance.now();

    try {
        const response = await fetch(monitor.url, {
            signal: AbortSignal.timeout(config.pollTimeoutMs)
        })

        const latency = Math.round(performance.now() - start);

        const ok = response.status === monitor.expected_status;

        return {
            ok,
            status_code: response.status,
            latency_ms: latency,
            error: ok ? null : `Expected ${monitor.expected_status}, received ${response.status}`
        };
        
    } catch (err) {
        
        return {
            ok: false,
            status_code: null,
            latency_ms: null,
            error: err.name === "TimeoutError" ? "Request timed out" : err.message
        };
        
    }
}