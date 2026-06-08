import mongoose from 'mongoose';
import { Comment } from './models/Comment.js';
import { User } from './models/User.js';

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for Seeding...");

    const ticketId = "6a8af6b571b31e966f316483";

    // 1. Fetch some users
    const users = await User.find().limit(3);
    if (users.length === 0) {
      console.log("No users found to author comments. Please create a user first.");
      process.exit(1);
    }

    const u1 = users[0];
    const u2 = users.length > 1 ? users[1] : users[0];
    const u3 = users.length > 2 ? users[2] : users[0];

    // Clear existing comments on this ticket (optional, but good for clean testing)
    await Comment.deleteMany({ ticketId });
    console.log("Cleared existing comments for this ticket.");

    // 2. Create System Log 1
    await Comment.create({
      ticketId,
      text: `${u1.name} changed ticket status from "TODO" to "IN_PROGRESS"`,
      authorId: u1._id,
      type: "system",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
    });

    // 3. Create Top Level Comment 1
    const c1 = await Comment.create({
      ticketId,
      text: "I've started investigating the memory leak. It looks like it's happening inside the canvas rendering loop.",
      authorId: u1._id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.5) // 1.5 days ago
    });

    // 4. Create Reply 1 to C1
    await Comment.create({
      ticketId,
      text: "Are you sure? I ran a profiler yesterday and the canvas context was being garbage collected properly.",
      authorId: u2._id,
      parentCommentId: c1._id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.2)
    });

    // 5. Create System Log 2
    await Comment.create({
      ticketId,
      text: `${u2.name} updated the priority to "HIGH"`,
      authorId: u2._id,
      type: "system",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.1)
    });

    // 6. Create Reply 2 to C1
    await Comment.create({
      ticketId,
      text: "Actually, you're right. I attached a new detached DOM node instead. Found the culprit! 🐛",
      authorId: u1._id,
      parentCommentId: c1._id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 0.5)
    });

    // 7. Create Top Level Comment 2
    await Comment.create({
      ticketId,
      text: "Drafting the PR right now. Should be ready for review by EOD.",
      authorId: u3._id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    });

    // 8. Create System Log 3
    await Comment.create({
      ticketId,
      text: `${u3.name} changed ticket status from "IN_PROGRESS" to "IN_REVIEW"`,
      authorId: u3._id,
      type: "system",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1) // 1 hour ago
    });

    console.log("Successfully seeded rich comment thread (with replies and system logs)!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seed();
