import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import userRoute from "./routes/user.routes.js";
import databaseConnection from "./config/db.config.js";
import passport from './middlewares/passport.middleWare.js'
import session from "express-session";
import authRoutes from "./routes/auth.routers.js"
import locationRouter from "./routes/location.routers.js"
import {getStories, oneStory} from "./controllers/stories/stories.controller.js";
import messageRoute from "./routes/message.routes.js";
import notificationRoute from "./routes/notification.routes.js";
import dotenv from 'dotenv'
dotenv.config()

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://buddy-pair-dating-app.vercel.app"],
    methods: ["GET", "POST","PUT","DELETE","PATCH"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Handle preflight requests (OPTIONS)
app.options('*', cors());

// Configure session middleware
app.use(
  session({
    secret: "upbwgfqrgtiqpfvqeig330iv39buiv", // replace with your secret key
    resave: false, // don't save session if unmodified
    saveUninitialized: true, // save uninitialized sessions
    cookie: { secure: false }, // set to true if using HTTPS
  })
);
app.use(passport.initialize());
app.use(passport.session());
// passport.use(new LocalStrategy(authUser))

// routes/
app.use("/", authRoutes)
app.use("/api/v1/users", userRoute);
app.use("/api/v1/messages", messageRoute);
app.use("/api/v1/notifications", notificationRoute);

// get user stories
app.get("/story/:id", oneStory)
app.get("/story", getStories)

app.use("/location", locationRouter)

export {app}
