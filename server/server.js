import express from "express";
import { mongooseConnect } from "./util/database";
import cors from "cors";

import ticketRouter from "./routes/ticket";
import { teamsRouter } from "./routes/team";
import { userRouter } from "./routes/user";
import { User } from "./models/user";
const app = express();

//req.body parser
app.use(express.json());
app.use(cors());

//middleware to add user to req.user
app.use(async (req, res, next) => {
  const userId = req.headers.userid || "6981f1014856de3ab98aff07";
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

app.use("/", (req, res, next) => {
  res.json({
    message: "hello from server",
  });
});
mongooseConnect(() => {
  app.listen(8000);
});
