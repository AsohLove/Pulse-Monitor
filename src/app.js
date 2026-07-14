import express from "express"

export function createApp (){

    const app = express();

    app.use(express.json());

    app.use('/', (req, res) => {
        res.json({
            success: true,
            name: "Pulse-Uptime Monitor api",
            description: "Pulse is a REST API for monitoring website uptime, recording incidents, and serving a public status page"
        })
    })


    app.use('/health', (req, res) => {
        res.json({
            status: "OK"
        })
    })


    return app;
}