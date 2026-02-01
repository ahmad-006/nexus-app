import { ObjectId } from "mongodb";
import { getDb } from "../util/database";

export class Team {
  constructor(name, ownerId, admins, members) {
    this.name = name;
    this.ownerId = new ObjectId(ownerId);
    this.admins = admins.map((id) => new ObjectId(id));
    this.members = members.map((id) => new ObjectId(id));
  }

  async create() {
    const db = getDb();
    const result = await db.collection("teams").insertOne({
      name: this.name,
      ownerId: this.ownerId,
      admins: this.admins,
      members: this.members,
      createdAt: new Date(),
    });
    console.log("Team created");
    return result;
  }

  static async isAdmin(teamId, userId) {
    const db = getDb();
    const res = await db.collection("teams").findOne({
      _id: new ObjectId(teamId),
      admins: new ObjectId(userId),
    });

    console.log("isAdmin :", !!res);
    return !!res;
  }

  static async isMember(teamId, userId) {
    const db = getDb();
    const res = await db.collection("teams").findOne({
      _id: new ObjectId(teamId),
      members: new ObjectId(userId),
    });

    console.log("isMember :", !!res);
    return !!res;
  }

  static async promoteToAdmin(teamId, userId) {
    const db = getDb();
    const updatedTeam = await db.collection("teams").findOneAndUpdate(
      { _id: new ObjectId(teamId), members: new ObjectId(userId) },
      {
        $addToSet: { admins: new ObjectId(userId) },
      },
    );
    console.log("updated team");
    return updatedTeam;
  }
}