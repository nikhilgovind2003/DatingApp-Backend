import { Router } from "express";
import { getMessages, sendMessage, getChatList, markMessagesAsRead, getRecentMessagedUsers } from "../controllers/message/message.controller.js";
import { verifyUser } from "../middlewares/verifyjwt.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/send/:id", verifyUser, upload.single("attachment"), sendMessage);
router.patch("/read/:id", verifyUser, markMessagesAsRead);
router.get("/list", verifyUser, getChatList);
router.get("/recent", verifyUser, getRecentMessagedUsers);
router.get("/:id", verifyUser, getMessages);

export default router;
