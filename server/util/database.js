import mongoose from "mongoose";

export const mongooseConnect = (cb) => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then((client) => {
      console.log("DB Connected");
      cb(client);
    })
    .catch((err) => console.error(err));
};
