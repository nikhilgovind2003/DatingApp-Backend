import { Router } from "express";
import { getMessages, sendMessage, getChatList, markMessagesAsRead } from "../controllers/message/message.controller.js";
import { verifyUser } from "../middlewares/verifyjwt.middleware.js";

const router = Router();

router.post("/send/:id", verifyUser, sendMessage);
router.patch("/read/:id", verifyUser, markMessagesAsRead);
router.get("/list", verifyUser, getChatList);
router.get("/:id", verifyUser, getMessages);

export default router;
