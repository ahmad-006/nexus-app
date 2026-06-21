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
       * @param {Object} data - { teamId, message, tempId }
       */
      socket.on("send_team_message", async (data) => {
        const { teamId, message, tempId } = data || {};

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

        // Broadcast to everyone in the team room
        io.to(roomName).emit("receive_team_message", {
          _id: savedMessage._id,
          senderName: socket.user.name,
          senderId: {
            _id: socket.user._id,
            name: socket.user.name,
            email: socket.user.email,
            image: socket.user.image,
          },
          message: message,
          createdAt: savedMessage.createdAt,
          timestamp: savedMessage.createdAt,
          teamId: teamId,
          tempId: tempId || null,
        });

        console.log(`Chat in ${roomName}: ${socket.user.name} -> ${message}`);
      });

      /**
       * @event enter_chat
       * @param {Object} data - { partnerId }
       */
      socket.on("enter_chat", (data) => {
        const { partnerId } = data || {};
        if (partnerId) {
          socket.activeChatPartnerId = partnerId.toString();
        }
      });

      /**
       * @event leave_chat
       */
      socket.on("leave_chat", () => {
        socket.activeChatPartnerId = null;
      });

      /**
       * @event mark_messages_read
       * @param {Object} data - { senderId, teamId }
       */
      socket.on("mark_messages_read", async (data) => {
        const { senderId } = data || {};
        if (!senderId) return;

        const readerId = socket.user._id.toString();

        // 1. Instantly broadcast over socket without waiting for DB disk latency
        io.to(`user_${senderId}`).emit("messages_read", {
          readerId,
          senderId: senderId.toString(),
        });

        // 2. Persist in database asynchronously
        try {
          await Message.updateMany(
            { senderId, receiverId: readerId, isRead: false },
            { $set: { isRead: true } }
          );
        } catch (err) {
          console.error("Error in mark_messages_read DB update:", err);
        }
      });

      /**
       * @event send_private_message
       * @param {Object} data - { receiverId, message, teamId, tempId }
       */
      socket.on("send_private_message", async (data) => {
        const { receiverId, message, teamId, tempId } = data || {};
        if (!receiverId || !message || !teamId) return;

        // Check if receiver is currently viewing this exact chat
        let isImmediatelyRead = false;
        const receiverRoom = `user_${receiverId}`;
        const receiverSocketIds = io.sockets.adapter.rooms.get(receiverRoom);

        if (receiverSocketIds && receiverSocketIds.size > 0) {
          for (const socketId of receiverSocketIds) {
            const receiverSocket = io.sockets.sockets.get(socketId);
            if (
              receiverSocket &&
              receiverSocket.activeChatPartnerId === socket.user._id.toString()
            ) {
              isImmediatelyRead = true;
              break;
            }
          }
        }

        // 1. Persistence (Save to Database with team context and immediate read state)
        const savedMessage = await Message.create({
          senderId: socket.user._id,
          receiverId,
          message,
          teamId,
          isRead: isImmediatelyRead,
        });

        // 2. Identify Rooms (Target both for multi-device sync)
        const senderRoom = `user_${socket.user._id}`;

        const payload = {
          _id: savedMessage._id,
          senderId: {
            _id: socket.user._id,
            name: socket.user.name,
            email: socket.user.email,
            image: socket.user.image,
          },
          receiverId,
          senderName: socket.user.name,
          message: savedMessage.message,
          createdAt: savedMessage.createdAt,
          timestamp: savedMessage.createdAt,
          teamId,
          tempId: tempId || null,
          isRead: isImmediatelyRead,
        };

        // 3. Emit Full Payload to Both
        io.to(receiverRoom).to(senderRoom).emit("receive_private_message", payload);

        console.log(
          `Private: ${socket.user.name} -> User(${receiverId}): ${message} (read=${isImmediatelyRead})`,
        );
      });

      // Typing indicators
      socket.on("typing_start", (data) => {
        const { teamId, conversationId, isDM, receiverId } = data || {};
        if (isDM && receiverId) {
          io.to(`user_${receiverId}`).emit("user_typing", {
            conversationId,
            userId: socket.user._id.toString(),
            userName: socket.user.name,
          });
        } else if (teamId) {
          socket.to(`team_${teamId}`).emit("user_typing", {
            conversationId: conversationId || teamId,
            userId: socket.user._id.toString(),
            userName: socket.user.name,
          });
        }
      });

      socket.on("typing_stop", (data) => {
        const { teamId, conversationId, isDM, receiverId } = data || {};
        if (isDM && receiverId) {
          io.to(`user_${receiverId}`).emit("user_stop_typing", {
            conversationId,
            userId: socket.user._id.toString(),
          });
        } else if (teamId) {
          socket.to(`team_${teamId}`).emit("user_stop_typing", {
            conversationId: conversationId || teamId,
            userId: socket.user._id.toString(),
          });
        }
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
