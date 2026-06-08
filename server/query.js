import mongoose from 'mongoose';
import { Team } from './models/Team.js';
import { User } from './models/User.js';
import { Comment } from './models/Comment.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // 1. Get Nexus Alpha Platform Users
    const team = await Team.findOne({ name: /Nexus Alpha Platform/i });
    if (team) {
      // FIX: The users had no teams assigned. Let's assign everyone to this team for testing.
      await User.updateMany({}, { $addToSet: { teams: team._id } });

      const users = await User.find({ teams: team._id }).select('name email');
      console.log("=== NEXUS ALPHA PLATFORM USERS ===");
      console.table(users.map(u => ({ Name: u.name, Email: u.email })));
      console.log("===================================");
    } else {
      console.log("Team 'Nexus Alpha Platform' not found!");
    }

    // 2. Flood Ticket 6a8af6b571b31e966f316483 with comments
    const ticketId = "6a8af6b571b31e966f316483";
    await Comment.deleteMany({ ticketId }); // Clear old ones
    
    const allUsers = await User.find().limit(5);
    const getRandomUser = () => allUsers[Math.floor(Math.random() * allUsers.length)]._id;
    
    console.log("Seeding massive comment thread...");
    
    let commentsCreated = 0;
    
    // Create 15 Top Level Comments
    for (let i = 0; i < 15; i++) {
      const parent = await Comment.create({
        ticketId,
        text: `Top level comment ${i + 1}: Investigating the structural integrity of the codebase. We need to refactor the legacy modules before the next sprint.`,
        authorId: getRandomUser(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * (100 - i * 5))
      });
      commentsCreated++;
      
      // Each top level comment has 1 to 4 replies
      const numReplies = Math.floor(Math.random() * 4) + 1;
      for (let j = 0; j < numReplies; j++) {
        await Comment.create({
          ticketId,
          text: `Reply ${j + 1} to comment ${i + 1}: I completely agree. Let's schedule a meeting to discuss the architecture.`,
          authorId: getRandomUser(),
          parentCommentId: parent._id,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * (100 - i * 5 - j))
        });
        commentsCreated++;
      }
      
      // Occasionally throw in a system log
      if (i % 3 === 0) {
        await Comment.create({
          ticketId,
          type: "system",
          text: `User updated the status in response to comment ${i + 1}`,
          authorId: getRandomUser(),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * (100 - i * 5 - 0.5))
        });
        commentsCreated++;
      }
    }

    console.log(`Successfully flooded ticket with ${commentsCreated} comments, replies, and logs!`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
