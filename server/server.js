import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cookieParser from "cookie-parser";

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
app.use(helmet());

//cors
const corsOptions = {
  origin: [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:8000"],
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

//request limiting so that 100 api requests are allowed in an hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

//Routes
app.use("/api/teams", teamsRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/comments", commentRouter);

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

//connecting DB and then starting the server
mongooseConnect(() => {
  server = app.listen(8000);
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
