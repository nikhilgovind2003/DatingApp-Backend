import { Server } from "socket.io";

let activeUsers = [];
const users = {};

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5000"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // Join the socket room specific to the user
    socket.on('joinRoom', (userId) => {
      if (userId) {
        // Store the mapping of userId to the current socket.id
        users[userId] = socket.id;
        socket.join(userId); // User joins a room based on their userId
      }
    });

    // add new User
    socket.on("new-user-add", (newUserId) => {
      // if user is not added previously
      if (!activeUsers.some((user) => user.userId === newUserId)) {
        activeUsers.push({ userId: newUserId, socketId: socket.id });
      }
      // send all active users to new user
      io.emit("get-users", activeUsers);
    });

    socket.on("disconnect", () => {
      // remove user from active users
      activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
      // send all active users to all users
      io.emit("get-users", activeUsers);
    });

    //send notification
    socket.on('sendNotification', ({ from, to, type }) => {
      if (users[to]) {
        io.to(users[to]).emit('newNotification', {
          type,
          sender: from,
          receiver: to,
        });
      }
    });

    // send message to a specific user
    socket.on("send-message", (data) => {
      const { receiverId } = data;
      const user = activeUsers.find((user) => user.userId === receiverId);
      if (user) {
        io.to(user.socketId).emit("recieve-message", data);
      }
    });
  });

  return io;
};
