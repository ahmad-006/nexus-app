import mongoose, { Schema, Types } from "mongoose";

const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE"],
      default: "TODO",
      required: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],

      required: true,
    },
    reporterId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    assigneeId: {
      type: Types.ObjectId,
      ref: "User",
      required: false,
    },
    teamId: {
      type: Types.ObjectId,
      ref: "Team",
      required: true,
    },
  },
  { timestamps: true },
);

export const Ticket = mongoose.model("Ticket", ticketSchema);
