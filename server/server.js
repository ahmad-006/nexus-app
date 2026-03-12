import express from "express";
import cors from "cors";
import morgan from "morgan";

// DB connection
import { mongooseConnect } from "./util/database";

//routes
import { ticketRouter } from "./routes/ticketRoutes.js";
import { teamsRouter } from "./routes/teamRoutes.js";
import { userRouter } from "./routes/userRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
import { globalErrorHandler } from "./controllers/errorController.js";
import { AppError } from "./util/appError.js";
//handling uncaught exceptions......
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, ": ", err.message);
  process.exit(1);
});

const app = express();

//req.body parser
app.use(express.json());
app.use(cors());
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

//Routes
app.use("/api/teams", teamsRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

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
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, ": ", err.message);
  server.close(() => {
    process.exit(1);
  });
});
