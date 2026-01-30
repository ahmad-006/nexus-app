import express from "express";

const app = express();
app.use("/", (req, res) => {
  res.send("Welcome to the server");
});

app.listen(3000);
