import { app } from "./app.js";
import { initSocket } from "./socket/socket.js";
import http from "http";

import dotenv from 'dotenv';
import databaseConnection from "./config/db.config.js";

dotenv.config({
    path: './.env'
});

databaseConnection();

const port = process.env.PORT || 4000;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(port, () => {
    console.log(`server is up on port ${port}`)
})

