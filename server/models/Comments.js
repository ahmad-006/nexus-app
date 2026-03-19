import mongoose, { Schema, Types } from "mongoose";

const commentSchema = new Schema(
  {
    ticketId: {
      type: Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    authorId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentCommentId: {
      type: Types.ObjectId,
      ref: "Comment",
    },
    type: {
      type: String,
      enum: ["comment", "system"],
      default: "comment",
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Comment = mongoose.model("Comment", commentSchema);
