import express from "express";
import { verifyUser } from "../middlewares/verifyjwt.middleware.js";
import { getLocation } from "../controllers/location/location.controller.js";

    
const location = express.Router();

location.post("/", verifyUser, getLocation);


export default location