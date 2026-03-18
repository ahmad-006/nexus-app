import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User.js";
import { Team } from "../models/Team.js";
import { Ticket } from "../models/Ticket.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: "./.env" });

const DB = process.env.MONGODB_URI;

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => console.log("DB connection error: ", err));

// READ JSON FILES
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/data/users.json`, "utf-8"),
);
const teams = JSON.parse(
  fs.readFileSync(`${__dirname}/data/teams.json`, "utf-8"),
);
const tickets = JSON.parse(
  fs.readFileSync(`${__dirname}/data/tickets.json`, "utf-8"),
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await User.create(users, { validateBeforeSave: false });
    await Team.create(teams);
    await Ticket.create(tickets);
    console.log("Data successfully loaded!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Team.deleteMany();
    await Ticket.deleteMany();
    console.log("Data successfully deleted!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
