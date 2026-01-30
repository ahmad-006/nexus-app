import express from "express";
import { mongoConnect } from "./util/database";

const app = express();

app.use("/", (req, res, next) => {
  res.json({
    message: "hello from server",
  });
});

mongoConnect(() => {
  console.log("DB CONNECTED SUCCESSFULLY");
  app.listen(8000);
});
