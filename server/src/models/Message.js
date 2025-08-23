import mongoose from "mongoose";
const { Schema } = mongoose;

const messageSchema = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  seenBy: [{ type: Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
