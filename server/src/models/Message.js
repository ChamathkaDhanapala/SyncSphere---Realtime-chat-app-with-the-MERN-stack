import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reaction: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,

      required: function () {
        return !this.isFile;
      },
    },
    isFile: {
      type: Boolean,
      default: false,
    },
    file: {
      filename: {
        type: String,
        required: function () {
          return this.isFile;
        },
      },
      originalName: {
        type: String,
        required: function () {
          return this.isFile;
        },
      },
      mimetype: {
        type: String,
        required: function () {
          return this.isFile;
        },
      },
      size: {
        type: Number,
        required: function () {
          return this.isFile;
        },
      },
      url: {
        type: String,
        required: function () {
          return this.isFile;
        },
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    deletedAt: {
      type: Date,
    },
    forwardedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    isForwarded: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    pinnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pinnedAt: {
      type: Date,
    },
    reactions: [reactionSchema],
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,

    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ isFile: 1 });
messageSchema.index({ isPinned: 1 });

messageSchema.virtual("isVisible").get(function () {
  return !this.isDeleted || !this.deletedBy.includes(this.sender);
});

export default mongoose.model("Message", messageSchema);
