import express from "express";
import cors from "cors";

// DB connection
import { mongooseConnect } from "./util/database";

//routes
import { ticketRouter } from "./routes/ticket.js";
import { teamsRouter } from "./routes/team.js";
import { userRouter } from "./routes/user.js";
import { User } from "./models/user.js";
import { authRouter } from "./routes/auth.js";
import { globalErrorHandler } from "./controllers/errorController.js";
import { catchAsync } from "./util/catchAsync.js";
import { AppError } from "./util/appError.js";
const app = express();

//req.body parser
app.use(express.json());
app.use(cors());

//middleware to add user to req.user
app.use(
  catchAsync(async (req, res, next) => {
    const userId = req.headers.userid || "69932c6251ca266d83a0234a";
    const user = await User.findById(userId);
    if (!user) return next(new AppError("User not found", 404));
    req.user = user;
    next();
  }),
);

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

mongooseConnect(() => {
  app.listen(8000);
});
