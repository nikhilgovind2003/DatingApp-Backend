import mongoose from "mongoose";
import Notification from "../../models/notification.model.js";
import UserModel from "../../models/user.model.js";
import { emitToUser } from "../../socket/socket.js";

export const createNotification = async (type, sender, receiver) => {
  try {
    const notification = new Notification({
      type,
      sender,
      receiver,
    });
    await notification.save();

    // Emit real-time notification via socket
    const populatedNotification = await notification.populate(
      "sender",
      "firstName lastName",
    );
    emitToUser(receiver, "newNotification", populatedNotification);

    return notification;
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};

export const getNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const notifications = await Notification.find({
      receiver: userId,
      isRead: false,
    })
      .populate("sender", "firstName")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Error fetching notifications" });
  }
};

export const markAsRead = async (req, res) => {
  const notificationId = req.params.id;
  const userId = req.user.id;
  try {
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    // Notify frontend to update unread count
    emitToUser(userId, "notificationRead", { notificationId });

    res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ error: "Error marking notification as read" });
  }
};
export const markMessageNotificationsAsRead = async (req, res) => {
  const senderId = req.params.senderId;
  const userId = req.user.id;
  try {
    await Notification.updateMany(
      { receiver: userId, sender: senderId, type: "message", isRead: false },
      { isRead: true },
    );
    // Notify frontend to update unread count
    emitToUser(userId, "notificationRead", { sender: senderId });

    res.status(200).json({ message: "Message notifications marked as read" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error marking message notifications as read" });
  }
};
export const markAllAsRead = async (req, res) => {
  const userId = req.user.id;
  try {
    await Notification.updateMany(
      { receiver: userId, isRead: false },
      { isRead: true },
    );

    // Notify frontend to update unread count
    emitToUser(userId, "notificationRead", { all: true });

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: "Error marking all notifications as read" });
  }
};

export const getSearchUsers = async (req, res) => {
  const { search } = req.query;
  const userId = req?.user?._id;

  try {
    const regex = new RegExp(search ?? "", "i");

    const users = await UserModel.aggregate([
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(userId) },
        },
      },
      {
        $lookup: {
          from: "profiles", // MongoDB collection name (lowercase, pluralized "Profile")
          localField: "_id",
          foreignField: "user",
          as: "profile",
        },
      },
      {
        $unwind: {
          path: "$profile",
          preserveNullAndEmptyArrays: true, // keep users who haven't created a profile yet
        },
      },
      {
        $match: {
          $expr: {
            $regexMatch: {
              input: {
                $concat: ["$firstName", " ", "$lastName"],
              },
              regex: search ?? "",
              options: "i",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          firstName: 1,
          lastName: 1,
          location: "$profile.location",
          profileImage: "$profile.profileImage",
        },
      },
    ]);

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
