import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to a User schema
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to a Conversation schema
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    attachment: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    messageType: {
      type: String,
      enum: ["text", "image", "audio"],
      default: "text",
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation", // Reference to a User schema
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const MessageModel = mongoose.model("Message", MessageSchema);
export default MessageModel;
