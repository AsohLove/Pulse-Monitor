import { createApp } from "./app.js";
import { createServer } from 'node:http'

const app = createApp()

const server = createServer(app)

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
    console.log(`Pulse monitor running on http://localhost:${PORT}`);
    
})