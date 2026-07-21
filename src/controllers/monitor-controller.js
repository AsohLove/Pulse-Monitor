import createError from 'http-errors';
import * as monitors from '../models/monitor-model.js'

export async function createNewMonitor(req, res, next){
    try {

        const ownerId = req.user.sub;

        const {name, url, interval_seconds, expected_status} = req.body;
         
        const monitor = await monitors.createMonitor(ownerId, name, url, interval_seconds, expected_status );

        res.status(201)
           .location(`/monitors/${monitor.id}`)
           .json({
                success: true,
                data: monitor
           });


    } catch (err) {
        next(err);
    }

}

export async function getSingleMonitor(req, res, next){
    try {
        const monitor =  await monitors.findSingleMonitorById(req.user.sub, req.params.id)

        if (!monitor) {
            throw createError(404, "Monitor not found")
        }

        res.json({
            success: true,
            data: monitor
        });

    } catch (err) {
        next(err);
    }
}

export async function getAllMonitors(req, res, next){
    try {
        const allMonitors = await monitors.listOwnerMonitors(req.user.sub);

        res.json({
            success: true,
            data: allMonitors
        });

    } catch (err) {
        next(err)
    }
}

export async function updateMonitor(req, res, next){
    try {
        const updated = await monitors.updateMonitor(
            req.user.sub,
            req.params.id,
            req.body
        );

        if (!updated) {
            throw createError(404, "Monitor not found.");
        }

        res.json({
            success: true,
            data: updated
        });


    } catch (err) {
        next(err)
    }
}

export async function deleteSingleMonitor(req, res, next){
    try {
        const deletedMonitor = await monitors.deleteMonitor(req.user.sub, req.params.id)

        if (deletedMonitor === 0) {
            throw createError(404, "Monitor not found.")
        }

        res.sendStatus(204);
    } catch (err) {
        
        next(err)
    }
}