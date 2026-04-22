import { Router } from "express";
import { getNotifications, markAllAsRead, markAsRead } from "../controllers/notification/notificationController.js";
import { verifyUser } from "../middlewares/verifyjwt.middleware.js";

const router = Router();

router.get("/", verifyUser, getNotifications);
router.patch("/read/:id", verifyUser, markAsRead);
router.patch("/read-all", verifyUser, markAllAsRead);

export default router;
