import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Message } from "../models/Message.js";
import { promisify } from "util";
import { catchAsync } from "./catchAsync.js";
import { AppError } from "./appError.js";

let io;

export const socketManager = {
  /**
   * Initialize Socket.io with the HTTP server
   */
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: [
          process.env.FRONTEND_URL,
          "http://localhost:5173",
          "http://localhost:8000",
        ],
        methods: ["GET", "POST", "PATCH", "DELETE"],
        credentials: true,
      },
    });

    // --- SOCKET MIDDLEWARE (THE BOUNCER) ---
    io.use(
      catchAsync(async (socket, next) => {
        const token =
          socket.handshake.auth.token ||
          socket.handshake.headers.cookie?.split("jwt=")[1]?.split(";")[0];

        if (!token) {
          return next(
            new AppError("Authentication error: No token provided", 401),
          );
        }

        let decoded;
        try {
          decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        } catch (err) {
          return next(
            new AppError(
              "Authentication error: Invalid or malformed token",
              401,
            ),
          );
        }

        const currentUser = await User.findById(decoded.id).populate("teams");
        if (!currentUser) {
          return next(
            new AppError("Authentication error: User not found", 401),
          );
        }

        socket.user = currentUser;
        next();
      }),
    );

    // --- CONNECTION LOGIC ---
    io.on("connection", async (socket) => {
      console.log(`User connected: ${socket.user.name} (${socket.id})`);

      // 5. AUTO-JOIN TEAM ROOMS
      if (socket.user.teams && socket.user.teams.length > 0) {
        socket.user.teams.forEach((team) => {
          const roomName = `team_${team._id}`;
          socket.join(roomName);
          console.log(`User ${socket.user.name} joined room: ${roomName}`);
        });
      }

      // 6. AUTO-JOIN PRIVATE CHAT ROOM
      if (socket.user.id) {
        const roomName = `user_${socket.user.id}`;
        socket.join(roomName);
        console.log(`User ${socket.user.name} joined room: ${roomName}`);
      }

      // 7. JOIN SPECIFIC TICKET ROOM (Called by frontend when opening a ticket)
      socket.on("join_ticket", (ticketId) => {
        if (!ticketId) return;
        const roomName = `ticket_${ticketId}`;
        socket.join(roomName);
        console.log(`User ${socket.user.name} joined ticket room: ${roomName}`);
      });
      
      socket.on("leave_ticket", (ticketId) => {
        if (!ticketId) return;
        const roomName = `ticket_${ticketId}`;
        socket.leave(roomName);
        console.log(`User ${socket.user.name} left ticket room: ${roomName}`);
      });

      // --- TEAM CHAT LOGIC ---
      /**
       * @event send_team_message
       * @param {Object} data - { teamId, message }
       */

      socket.on("send_team_message", async (data) => {
        const { teamId, message } = data;

        if (!teamId || !message) return;

        // Verify membership (In-Memory from populated teams)
        const isMember = socket.user.teams.some(
          (t) => t._id.toString() === teamId,
        );
        if (!isMember) return;

        // PERSIST TO DATABASE
        const savedMessage = await Message.create({
          senderId: socket.user._id,
          teamId: teamId,
          message: message,
        });

        const roomName = `team_${teamId}`;

        // Shout to everyone in the room
        io.to(roomName).emit("receive_team_message", {
          _id: savedMessage._id,
          senderName: socket.user.name,
          senderId: socket.user._id,
          message: message,
          timestamp: savedMessage.createdAt,
          teamId: teamId,
        });

        console.log(`Chat in ${roomName}: ${socket.user.name} -> ${message}`);
      });

      socket.on("send_private_message", async (data) => {
        const { receiverId, message, teamId } = data;
        if (!receiverId || !message || !teamId) return;

        // 1. Persistence (Save to Database with team context)
        const savedMessage = await Message.create({
          senderId: socket.user._id,
          receiverId,
          message,
          teamId,
        });

        // 2. Identify Rooms (Target both for multi-device sync)
        const receiverRoom = `user_${receiverId}`;
        const senderRoom = `user_${socket.user._id}`;

        // 3. Emit Full Payload to Both
        io.to(receiverRoom).to(senderRoom).emit("receive_private_message", {
          _id: savedMessage._id,
          senderId: socket.user._id,
          senderName: socket.user.name,
          message: savedMessage.message,
          timestamp: savedMessage.createdAt,
        });

        console.log(
          `Private: ${socket.user.name} -> User(${receiverId}): ${message}`,
        );
      });

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.user.name}`);
      });
    });

    console.log("Socket.io Initialized successfully........!");
    return io;
  },

  /**
   * Get the initialized IO instance
   */
  getIO: () => {
    if (!io) {
      new AppError("Socket.io not initialized", 500);
    }
    return io;
  },
};
