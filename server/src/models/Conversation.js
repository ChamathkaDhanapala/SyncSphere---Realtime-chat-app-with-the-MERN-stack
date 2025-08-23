import mongoose from "mongoose";
const { Schema } = mongoose;

const conversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  latestMessage: { type: Schema.Types.ObjectId, ref: "Message" }
}, { timestamps: true });

export default mongoose.model("Conversation", conversationSchema);
