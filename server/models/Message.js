import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Optional for Team messages
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Message = mongoose.model("Message", messageSchema);
