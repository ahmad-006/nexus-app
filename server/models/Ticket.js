import mongoose, { Schema, Types } from 'mongoose';

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
      enum: ['TODO', 'IN_PROGRESS', 'DONE'],
      default: 'TODO',
      required: true,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],

      required: true,
    },
    reporterId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assigneeId: {
      type: Types.ObjectId,
      ref: 'User',
      required: false,
    },
    teamId: {
      type: Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    dueDate: {
      type: Date,
    },
    attachments: [
      {
        url: String,
        name: String,
        fileId: String, // Storing ImageKit fileId for potential deletion
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

ticketSchema.index(
  { title: 'text', description: 'text' },
  { weights: { title: 10, description: 2 }, name: 'TextIndex' }
);

export const Ticket = mongoose.model('Ticket', ticketSchema);
