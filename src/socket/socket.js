import { Server } from "socket.io";
import UserModel from "../models/user.model.js";

let io;
const userSocketMap = new Map(); // userId -> socketId

/**
 * Initialize Socket.io server
 */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : ["http://localhost:5173", "http://localhost:5000"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join room and map userId to socketId
    socket.on('joinRoom', async (userId) => {
      if (!userId) return;

      userSocketMap.set(userId, socket.id);
      socket.join(userId);
      console.log(`User ${userId} joined room. Socket: ${socket.id}`);

      // Update user status in DB
      try {
        await UserModel.findByIdAndUpdate(userId, { isActive: true });
        // Broadcast that this user is now online
        io.emit("userStatusChange", { userId, isActive: true });
      } catch (error) {
        console.error("Error updating user status on joinRoom:", error);
      }
    });

    // Handle explicit status check
    socket.on("checkStatus", (userId) => {
      const isActive = userSocketMap.has(userId);
      socket.emit("statusResponse", { userId, isActive });
    });

    socket.on("disconnect", async () => {
      let disconnectedUserId = null;
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }

      if (disconnectedUserId) {
        userSocketMap.delete(disconnectedUserId);
        console.log(`User ${disconnectedUserId} disconnected`);

        try {
          await UserModel.findByIdAndUpdate(disconnectedUserId, { isActive: false });
          // Broadcast that this user is now offline
          io.emit("userStatusChange", { userId: disconnectedUserId, isActive: false });
        } catch (error) {
          console.error("Error updating user status on disconnect:", error);
        }
      }
    });

    // Simple ping/pong or explicit notification emit (though controllers will mostly use getIO)
    socket.on('sendNotification', ({ from, to, type }) => {
      const receiverSocketId = userSocketMap.get(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newNotification', {
          type,
          sender: from,
          receiver: to,
        });
      }
    });
  });

  return io;
};

/**
 * Get global IO instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

/**
 * Get socketId for a specific userId
 */
export const getSocketId = (userId) => {
  return userSocketMap.get(String(userId));
};

/**
 * Send event to a specific user
 */
export const emitToUser = (userId, event, data) => {
  const socketId = getSocketId(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
    return true;
  }
  return false;
};
