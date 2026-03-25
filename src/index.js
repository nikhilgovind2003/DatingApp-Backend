import "dotenv/config.js";
import { app } from "./app.js";
import { initSocket } from "./socket/socket.js";
import http from "http";
import databaseConnection from "./config/db.config.js";

databaseConnection();

const port = process.env.PORT || 4000;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(port, () => {
    console.log(`server is up on port ${port}`)
})

