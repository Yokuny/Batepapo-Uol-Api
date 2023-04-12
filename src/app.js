import express from "express";
const app = express();
app.use(express.json());

import postParticipants from "./routs/postParticipants.js";
import getParticipants from "./routs/getParticipants.js";
import postMessages from "./routs/postMessages.js";
import getmessages from "./routs/getMessages.js";
import postStatus from "./routs/postStatus.js";
app.post("/participants", postParticipants);
app.get("/participants", getParticipants);
app.post("/messages", postMessages);
app.get("/messages", getmessages);
app.post("/status", postStatus);

app.listen(5000);