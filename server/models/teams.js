import { ObjectId } from "mongodb";
import { getDb } from "../util/database";

export class Team {
  constructor(name, ownerId, admins, members) {
    this.name = name;
    this.ownerId = new ObjectId(ownerId);
    this.admins = admins.map((id) => new ObjectId(id));
    this.members = members.map((id) => new ObjectId(id));
  }
}