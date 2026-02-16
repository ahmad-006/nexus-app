import mongoose, { Schema, Types } from "mongoose";

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    min: [8, "A password must be minimum of 8 character"],
  },
  image: String,
  teams: [
    {
      _id: false,
      teamId: {
        type: Types.ObjectId,
        ref: "Team",
        required: true,
      },
      role: {
        type: String,
        enum: ["admin", "member"],
        Default: "member",
      },
    },
  ],
  resetToken: String,
  resetTokenExpiration: Date,
});

export const User = mongoose.model("User", userSchema);
