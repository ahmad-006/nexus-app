import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";

// DB connection
import { mongooseConnect } from "./util/database.js";

// Socket Manager
import { socketManager } from "./util/socket.js";

//routes
import { ticketRouter } from "./routes/ticketRoutes.js";
import { teamsRouter } from "./routes/teamRoutes.js";
import { userRouter } from "./routes/userRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
import { commentRouter } from "./routes/commentRoutes.js";
import { messageRouter } from "./routes/messageRoutes.js";
import { activityRouter } from "./routes/activityRoutes.js";
import { notificationRouter } from "./routes/notificationRoutes.js";
import { globalErrorHandler } from "./controllers/errorController.js";
import { AppError } from "./util/appError.js";
import { nexusGuard } from "./util/sanitize.js";

//handling uncaught exceptions......
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, ": ", err.message);
  process.exit(1);
});

const app = express();

//GLOBAL MIDDLEWARES
//Set security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

//cors
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:8000",
].filter(Boolean);

const corsOptions = {
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));

//morgan for logging all the requests server receives
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

//req.body parser
app.use(express.json({ limit: "10kb" }));

//req.cookie parsing
app.use(cookieParser());

//NoSQL and XSS sanitization middleware
app.use(nexusGuard);

//request limiting: strict in production, relaxed in development
//request limiting: strict in production, relaxed in development
const limiter = rateLimit({
  max: process.env.NODE_ENV === "development" ? 10000 : 2000,
  windowMs: 15 * 60 * 1000,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

// Health check endpoint for uptime monitors / keep-alive pings
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

//Routes
app.use("/api/teams", teamsRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/comments", commentRouter);
app.use("/api/messages", messageRouter);
app.use("/api/activities", activityRouter);
app.use("/api/notifications", notificationRouter);

// Serve static React production build if available
const __dirname = path.resolve();
const clientDistPath = path.join(__dirname, "client", "dist");
const altClientDistPath = path.join(__dirname, "..", "client", "dist");
const resolvedDist = fs.existsSync(clientDistPath)
  ? clientDistPath
  : fs.existsSync(altClientDistPath)
  ? altClientDistPath
  : null;

if (resolvedDist) {
  app.use(express.static(resolvedDist));

  // Catch-all route for SPA navigation (excluding /api routes)
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(resolvedDist, "index.html"));
  });
}

app.all(/.*/, (req, res, next) => {
  const error = new AppError(
    `Can't find ${req.originalUrl} on this server`,
    404,
  );
  next(error);
});

// Global Error Handler
app.use(globalErrorHandler);
let server;

const PORT = process.env.PORT || 8000;

//connecting DB and then starting the server
mongooseConnect(() => {
  server = app.listen(PORT, () => {
    console.log(`NEXUS Server listening on port ${PORT}...`);
  });
  // Initialize Socket.io after the server starts listening
  socketManager.init(server);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, ": ", err.message);
  server.close(() => {
    process.exit(1);
  });
});
