import express from "express"
import createError from 'http-errors';

import authRouter from './routes/auth-routes.js'

import monitorROutes from './routes/monitor-routes.js'


export function createApp (){

    const app = express();

    app.use(express.json());

    app.use('/health', (req, res) => {
        res.json({
            status: "OK"
        })
    })

    // app.use('/', (req, res) => {
    //     res.status(200).json({
    //         success: true,
    //         name: "Pulse-Uptime Monitor api",
    //         description: "Pulse is a REST API for monitoring website uptime, recording incidents, and serving a public status page"
    //     })
    // })

    app.use('/auth', authRouter);

    app.use('/monitors', monitorROutes)

    app.use((req, res, next) => {
        next(createError(404, "Resource not found"))
    })

    app.use((err, req, res, next) => {

        // req.log.error(err);

        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal Server Error"
        });
    });




    return app;
}