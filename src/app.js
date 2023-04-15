import express from "express";
import dotenv from "dotenv";
import dbConnection from "./scripts/dbConnection.js";
import inactiveUser from "./scripts/inactiveUser.js";

import postParticipants from "./routes/postParticipants.js";
import getParticipants from "./routes/getParticipants.js";
import postMessages from "./routes/postMessages.js";
import getMessages from "./routes/getMessages.js";
import postStatus from "./routes/postStatus.js";

const app = express();
app.use(express.json());
dotenv.config();
const PORT = process.env.PORT || 5000;
const db = await dbConnection();
setInterval(inactiveUser, 1500, db);

app.post("/participants", (req, res) => postParticipants(req, res, db));
app.get("/participants", (req, res) => getParticipants(req, res, db));
app.post("/messages", (req, res) => postMessages(req, res, db));
app.get("/messages", (req, res) => getMessages(req, res, db));
app.post("/status", (req, res) => postStatus(req, res, db));

app.listen(PORT);