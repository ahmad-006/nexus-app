import express from "express";
import { mongoConnect } from "./util/database";

import ticketRouter from "./routes/ticket";
const app = express();

//req.body parser
app.use(express.json());

//middleware to add user to req.user
app.use((req, res, next) => {
  req.user = {
    _id: "697d0c92a8ad386d3970da2f",
    name: "Ahmad Aamir",
    email: "test@email.com",
  };
  next();
});

//Routes
app.use("/api/tickets", ticketRouter);

app.use("/", (req, res, next) => {
  res.json({
    message: "hello from server",
  });
});

mongoConnect(() => {
  console.log("DB CONNECTED SUCCESSFULLY");
  app.listen(8000);
});
