import { Router } from "express";
import { getNotifications, markAllAsRead, markAsRead, markMessageNotificationsAsRead } from "../controllers/notification/notificationController.js";
import { verifyUser } from "../middlewares/verifyjwt.middleware.js";

const router = Router();

router.get("/", verifyUser, getNotifications);
router.patch("/read/:id", verifyUser, markAsRead);
router.patch("/read-all", verifyUser, markAllAsRead);
router.patch("/read-by-sender/:senderId", verifyUser, markMessageNotificationsAsRead);

export default router;
