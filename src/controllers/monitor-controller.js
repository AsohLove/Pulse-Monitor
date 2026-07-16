import * as monitors from '../models/monitor-model.js'

export async function createNewMonitor(req, res, next){
    try {
         
        const monitor = await monitors.createMonitor(...req.body )


    } catch (error) {
        
    }
}