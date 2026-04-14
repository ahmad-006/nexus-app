import mongoose, { Schema } from "mongoose";

const activitySchema = new Schema(
  {
    userId: {
      ref: "User",
      type: Schema.Types.ObjectId,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      required: true,
      enum: ["Ticket", "Team", "User", "Comment"],
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: false,
    },
    details: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
