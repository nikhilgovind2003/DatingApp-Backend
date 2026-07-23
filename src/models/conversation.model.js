import mongoose from "mongoose";
const conversationModel = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  message: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message", default:[]}],
  createdAt: { type: Date, default: Date.now },
});

const ConversationModel = mongoose.model("Conversation", conversationModel);

export default ConversationModel;
