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
const app = express();

//req.body parser
app.use(express.json());
app.use(cors());

//middleware to add user to req.user
app.use(async (req, res, next) => {
  const userId = req.headers.userid || "69932c6251ca266d83a0234a";
  try {
    const user = await User.findById(userId);
    req.user = user;
    next();
  } catch (err) {
    console.log("Middleware User Error:", err.message);
    next();
  }
});

//Routes
app.use("/api/teams", teamsRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

app.use("/", (req, res, next) => {
  res.json({
    message: "hello from server",
  });
});

// Global Error Handler
app.use(globalErrorHandler);

mongooseConnect(() => {
  app.listen(8000);
});
