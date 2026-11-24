import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import UserModel from "../models/user.model.js";

let io;

const isOnline = (userId) => (io?.sockets.adapter.rooms.get(String(userId))?.size || 0) > 0;

/**
 * Initialize Socket.io server
 */
export const initSocket = (server) => {
  const origins = [...new Set([
    "http://localhost:5173",
    process.env.FRONTEND_URL?.replace(/\/$/, ""),
    process.env.BACKEND_URL,
  ].filter(Boolean))];

  io = new Server(server, {
    cors: {
      origin: origins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authenticate every socket with the same JWT used by the REST API
  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = socket.handshake.auth?.token || cookies.token;
      if (!token) return next(new Error("Unauthorized"));
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
      if (!decoded?.id || decoded.isTempGoogle) return next(new Error("Unauthorized"));
      socket.userId = String(decoded.id);
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.userId;
    socket.join(userId);

    try {
      await UserModel.findByIdAndUpdate(userId, { isActive: true });
      io.emit("userStatusChange", { userId, isActive: true });
    } catch (error) {
      console.error("Error updating user status on connect:", error);
    }

    // Kept for client compatibility; the identity always comes from the JWT
    socket.on("joinRoom", () => socket.join(userId));

    socket.on("checkStatus", (otherUserId) => {
      socket.emit("statusResponse", { userId: otherUserId, isActive: isOnline(otherUserId) });
    });

    socket.on("disconnect", async () => {
      // Only mark offline when the user's last tab/socket is gone
      if (isOnline(userId)) return;
      try {
        await UserModel.findByIdAndUpdate(userId, { isActive: false });
        io.emit("userStatusChange", { userId, isActive: false });
      } catch (error) {
        console.error("Error updating user status on disconnect:", error);
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
 * Send event to every connected socket (tab/device) of a user
 */
export const emitToUser = (userId, event, data) => {
  if (!io) return false;
  const online = isOnline(userId);
  io.to(String(userId)).emit(event, data);
  return online;
};
