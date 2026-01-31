import { ObjectId } from "mongodb";
import { getDb } from "../util/database";

export class Ticket {
  constructor(title, description, priority, userId) {
    this.title = title;
    this.description = description;
    this.status = "TODO";
    this.priority = priority;
    this.userId = userId;
  }

  save() {
    const db = getDb();

    return db
      .collection("tickets")
      .insertOne(this)
      .then((result) => {
        console.log("Ticket Added successfully");
        return { _id: result.insertedId, ...this };
      });
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection("tickets")
      .find()
      .toArray()
      .then((tickets) => tickets)
      .catch((err) => err);
  }

  static DeleteById(id) {
    const db = getDb();

    return db
      .collection("tickets")
      .deleteOne({ _id: new ObjectId(id) })
      .then(() => console.log("ticket deleted successfully"))
      .catch((err) => err);
  }

  static getById(id) {
    const db = getDb();

    return db
      .collection("tickets")
      .findOne({ _id: new ObjectId(id) })
      .then((ticket) => ticket)
      .catch((err) => error);
  }
  static updateById(id, updatedData) {
    const db = getDb();
    return db
      .collection("tickets")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatedData },
        { returnDocument: "after" },
      )
      .then((result) => result);
  }
}
