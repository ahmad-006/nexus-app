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
    passwordChangedAt: Date,
    resetToken: String,
    resetTokenExpiration: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
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

userSchema.pre("save", async function () {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return;

  // Hash the password with cost of 10
  this.password = await bcrypt.hash(this.password, 10);

  // Delete confirmPassword field
  this.confirmPassword = undefined;
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return;

  this.passwordChangedAt = Date.now() - 1000;
});

userSchema.virtual("teams", {
  ref: "Team",
  localField: "_id",
  foreignField: "members.userId",
  justOne: false,
});

userSchema.virtual("teamIds").get(function () {
  if (!this.teams) return [];
  return this.teams.map((team) => team._id);
});

export const User = mongoose.model("User", userSchema);
