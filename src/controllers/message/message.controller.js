import MessageModel from "../../models/message.model.js";
import ConversationModel from "../../models/conversation.model.js";
import { emitToUser } from "../../socket/socket.js";
import { createNotification } from "../notification/notificationController.js";

export const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const { message } = req.body;
    let chats = await ConversationModel.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chats) {
      chats = await ConversationModel.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new MessageModel({
      senderId,
      receiverId,
      message,
      conversationId: chats._id,
    });

    if (newMessage) {
      chats.message.push(newMessage._id);
    }

    // This will run in parallel
    await Promise.all([chats.save(), newMessage.save()]);

    // SOCKET.IO: Emit message to receiver
    emitToUser(receiverId, "receiveMessage", {
      senderId,
      message,
      conversationId: chats._id,
      createdAt: newMessage.createdAt
    });

    // Create a notification for the new message
    await createNotification("message", senderId, receiverId);

    res.status(201).json({ newMessage });
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let chats = await ConversationModel.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("message");

    if (!chats) res.status(200).send([]);

    const messages = chats.message;

    res.status(200).send(messages);
  } catch (error) {
    console.log(error.message);
    res.send("Internal server error!!!");
  }
};
