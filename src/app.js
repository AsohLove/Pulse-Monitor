import express from "express"

import authRouter from './routes/auth-routes.js'


export function createApp (){

    const app = express();

    app.use(express.json());

    // app.use('/', (req, res) => {
    //     res.status(200).json({
    //         success: true,
    //         name: "Pulse-Uptime Monitor api",
    //         description: "Pulse is a REST API for monitoring website uptime, recording incidents, and serving a public status page"
    //     })
    // })


    app.use('/health', (req, res) => {
        res.json({
            status: "OK"
        })
    })

     app.use('/auth', authRouter);


    return app;
}