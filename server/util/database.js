import { MongoClient } from "mongodb";
let _db;

export const mongoConnect = (cb) => {
  MongoClient.connect(process.env.MONGODB_URI)
    .then((client) => {
      _db = client.db("nexus");
      cb(client);
    })
    .catch((err) => console.log(err));
};

export const getDb = () => {
  if (_db) {
    return _db;
  }
  console.log("NO DB FOUND");
};
