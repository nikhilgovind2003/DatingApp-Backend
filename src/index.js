import {app} from "./app.js";
import "./socket/socket.js";

import dotenv from 'dotenv';
import databaseConnection from "./config/db.config.js";


dotenv.config({
    path: './.env'
});

databaseConnection();

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`server is up on port ${port}`)
})

