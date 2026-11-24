import mongoose from "mongoose";
const conversationModel = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  message: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message", default:[]}],
},
{ timestamps: true });

const ConversationModel = mongoose.model("Conversation", conversationModel);

export default ConversationModel;
