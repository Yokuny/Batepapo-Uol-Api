import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "../script/db.js";
const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

import inactiveUser from "../script/inactiveUser.js";

import postParticipants from "./routes/postParticipants.js";
import getParticipants from "./routes/getParticipants.js";
import postMessages from "./routes/postMessages.js";
import getmessages from "./routes/getMessages.js";
import postStatus from "./routes/postStatus.js";
app.post("/participants", postParticipants);
app.get("/participants", getParticipants);
app.post("/messages", postMessages);
app.get("/messages", getmessages);
app.post("/status", postStatus);

const PORT = parseInt(process.env.PORT) || 5000;

(async () => {
  await db();
  setInterval(inactiveUser, 1500);
  app.listen(PORT);
})();