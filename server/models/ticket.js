import mongoose, { Schema, Types } from "mongoose";

const ticketSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["TODO", "IN_PROGRESS", "DONE"],
    required: false,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    required: true,
  },
  reporterId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  assigneeId: {
    type: Types.ObjectId,
    ref: "User",
    required: false,
  },
  teamId: {
    type: Types.ObjectId,
    ref: "Team",
    required: false,
  },
});

export const Ticket = mongoose.model("Ticket", ticketSchema);

// export class Ticket {
//   constructor(title, description, priority, teamId, assignee, reporterId) {
//     this.title = title;
//     this.description = description;
//     this.status = "TODO";
//     this.priority = priority;
//     this.reporterId = new ObjectId(reporterId);
//     this.teamId = new ObjectId(teamId);
//     this.assignee = assignee;
//   }

//   save() {
//     const db = getDb();

//     return db
//       .collection("tickets")
//       .insertOne(this)
//       .then((result) => {
//         console.log("Ticket Added successfully");
//         return { _id: result.insertedId, ...this };
//       });
//   }

//   static async fetchAll(teamId) {
//     try {
//       const db = getDb();

//       return await db
//         .collection("tickets")
//         .find({ teamId: new ObjectId(teamId) })
//         .toArray();
//     } catch (err) {
//       console.error("Database Fetch Error:", err);
//       throw err;
//     }
//   }

//   static DeleteById(id) {
//     const db = getDb();

//     return db
//       .collection("tickets")
//       .deleteOne({ _id: new ObjectId(id) })
//       .then(() => console.log("ticket deleted successfully"))
//       .catch((err) => err);
//   }

//   static getById(id) {
//     const db = getDb();

//     return db
//       .collection("tickets")
//       .findOne({ _id: new ObjectId(id) })
//       .then((ticket) => ticket)
//       .catch((err) => err);
//   }
//   static updateById(id, updatedData) {
//     const db = getDb();
//     return db
//       .collection("tickets")
//       .findOneAndUpdate(
//         { _id: new ObjectId(id) },
//         { $set: updatedData },
//         { returnDocument: "after" },
//       )
//       .then((result) => result);
//   }
// }
