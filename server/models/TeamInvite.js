import mongoose, { Schema } from 'mongoose';

const teamInviteSchema = Schema(
  {
    teamId: {
      ref: 'Team',
      type: Schema.Types.ObjectId,
      required: true,
    },
    inviterId: {
      ref: 'User',
      type: Schema.Types.ObjectId,
      required: true,
    },
    inviteeId: {
      ref: 'User',
      type: Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true },
);

export const TeamInvite = mongoose.model('TeamInvite', teamInviteSchema);
