import MessageModel from "../../models/message.model.js";
import ConversationModel from "../../models/conversation.model.js";
import ProfileModel from "../../models/profile.model.js";
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

    res.status(200).send(messages);
  } catch (error) {
    console.log(error.message);
    res.send("Internal server error!!!");
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const receiverId = req.user._id;

    await MessageModel.updateMany(
      { senderId, receiverId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error in markMessagesAsRead:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatList = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all conversations where the user is a participant
    const conversations = await ConversationModel.find({
      participants: { $in: [userId] },
    }).populate({
      path: "participants",
      select: "firstName lastName email",
    }).sort({ updatedAt: -1 });

    // For each conversation, we need the last message and the other participant's profile
    const chatList = await Promise.all(conversations.map(async (conv) => {
      const otherParticipant = conv.participants.find(p => p._id.toString() !== userId.toString());
      
      if (!otherParticipant) return null;

      const profile = await ProfileModel.findOne({ user: otherParticipant._id }).select("profileImage");
      
      // Get the last message
      const lastMessage = await MessageModel.findOne({ conversationId: conv._id })
        .sort({ createdAt: -1 });

      // Get unread count for the logged-in user
      const unreadCount = await MessageModel.countDocuments({
        conversationId: conv._id,
        receiverId: userId,
        isRead: false
      });

      return {
        conversationId: conv._id,
        otherUser: {
          _id: otherParticipant._id,
          name: `${otherParticipant.firstName} ${otherParticipant.lastName}`,
          profileImage: profile?.profileImage?.url || ""
        },
        lastMessage: lastMessage?.message || "",
        lastMessageTime: lastMessage?.createdAt || conv.createdAt,
        unreadCount
      };
    }));

    res.status(200).json(chatList.filter(item => item !== null));
  } catch (error) {
    console.error("Error in getChatList:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
