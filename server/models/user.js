import mongoose, { Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: [8, "A password must be minimum of 8 character"],
      select: false,
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
          default: "member",
        },
      },
    ],
    passwordChangedAt: Date,
    resetToken: String,
    resetTokenExpiration: Date,
  },
  { timestamps: true },
);

userSchema.methods.isCorrectPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

export const User = mongoose.model("User", userSchema);
