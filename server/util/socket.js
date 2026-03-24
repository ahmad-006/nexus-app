import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
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

        const decoded = await promisify(jwt.verify)(
          token,
          process.env.JWT_SECRET,
        );

        const currentUser = await User.findById(decoded.id);
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
          const roomName = `team_${team.teamId}`;
          socket.join(roomName);
          console.log(`User ${socket.user.name} joined room: ${roomName}`);
        });
      }

      // --- TEAM CHAT LOGIC ---
      /**
       * @event send_team_message
       * @param {Object} data - { teamId, message }
       */

      socket.on("send_team_message", (data) => {
        const { teamId, message } = data;

        if (!teamId || !message) return;

        // Verify the user is actually in this team before shouting
        const isMember = socket.user.teams.some(
          (t) => t.teamId.toString() === teamId,
        );
        if (!isMember) return;

        const roomName = `team_${teamId}`;

        // Shout to everyone in the room
        io.to(roomName).emit("receive_team_message", {
          senderName: socket.user.name,
          senderId: socket.user._id,
          message: message,
          timestamp: new Date(),
        });

        console.log(`Chat in ${roomName}: ${socket.user.name} -> ${message}`);
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
