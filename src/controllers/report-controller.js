import createError from "http-errors";

import * as checks from "../models/check-model.js"
import * as monitors from "../models/monitor-model.js"
import * as incidents from "../models/incident-model.js"



export async function getSingleMonitorChecks(req, res, next){


 
    try {
        
        const monitor = await monitors.findSingleMonitorById(req.user.sub, Number(req.params.id));

        if (!monitor) {
            throw createError(404, "Monitor not found");
        }

       const { after, limit } = req.validatedQuery;

       const rows = await checks.getMonitorChecks(monitor.id, after, limit);

        res.json({
            success: true,
            data: rows,
            nextCursor: rows.length
                ? rows.at(-1).id 
                : null
        });
    



    } catch (err) {
        next(err)
    }

}

export async function downloadChecksCsv(req, res, next){

    try {
        const monitor = await monitors.findSingleMonitorById(req.user.sub, Number(req.params.id))

        if(!monitor){
            throw createError(404, "Monitor not found!!")
        }


        const rows = await checks.streamChecksCsv(monitor.id);

        const header = "checked_at,ok,status_code,latency_ms,error";

        const csv = [
            header, 
            ...rows.map(row => 
                [
                    row.checked_at,
                    row.ok,
                    row.status_code ?? "",
                    row.latency_ms ?? "",
                    row.error ?? ""
                ].join(",")
            )
        ].join("\n");

        res.type("text/csv")
           .attachment(`monitor-${monitor.id}.csv`)
           .send(csv)

    } catch (err) {
        next(err)
    }
}

export async function getMonitorUptime(req, res, next){

    try {
        
        const monitor = await monitors.findSingleMonitorById(req.user.sub, Number(req.params.id));

        if(!monitor){
            throw createError(404, "Monitor not found!!")
        }

        const { window } = req.validatedQuery;

        const stats = await monitors.getMonitorUptime(monitor.id, window);

        const uptime = 
            stats.total == 0 ? 100  : (
                Number(stats.successful)
                /
                Number(stats.total)
            ) * 100;

        res.json({
            success: true,
            data: {
                uptime_percent: Number(uptime.toFixed(2)),
                average_latency: stats.average_latency,
                p95_latency: stats.p95_latency
            }
        });


    } catch (err) {
        next(err)
    }
}

export async function listAllIncidents(req, res, next){

    try {
        
        const rows = await incidents.listIncidents();

        res.json({
            success: true,
            data: rows
        });


    } catch (err) {
        next(err);
    }
}

export async function listMonitorIncidents(req, res, next){

    try {
        
        const monitor = await monitors.findSingleMonitorById(req.user.sub, Number(req.params.id));

        if(!monitor){
            throw createError(404, "MOnitor not found!!")
        }

        const rows = await incidents.listMonitorIncidents(monitor.id);

        res.json({
            success: true,
            data: rows
        });


    } catch (err) {
        next(err)
    }
}

export async function getPublicStatus(req, res, next) {

    try {
        const monitorsList = await monitors.listAllActiveMonitors();

        const openIncidents = await incidents.listOpenIncidents();

        res.json({
            generated_at: new Date(),
            monitors: monitorsList,
            open_incidents: openIncidents
        });

    } catch (err) {
        next(err)
    }
}
