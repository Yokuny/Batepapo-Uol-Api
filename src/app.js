import express from "express";
import dotenv from "dotenv";
import dayjs from "dayjs";
import dbConnection from "./scripts/dbConnection.js";
import inactiveUser from "./scripts/inactiveUser.js";
import { userValidation, messageValidation, numberValidation } from "./scripts/validation.js";

const app = express();
app.use(express.json());

dotenv.config();
const PORT = process.env.PORT || 5000;

const db = await dbConnection();

setInterval(inactiveUser, 1500, db);

app.post("/participants", async (req, res) => {
  const { name } = req.body;
  const { error } = userValidation.validate({ name });
  if (error) return res.status(422).send({ message: error.message });
  try {
    const usersDatabase = await db.collection("participants").findOne({ name: name });
    if (usersDatabase) {
      return res.status(409).send("User already exists");
    } else {
      const time = dayjs().format("HH:mm:ss");
      await db.collection("participants").insertOne({ name: name, lastStatus: Date.now() });
      await db
        .collection("messages")
        .insertOne({ from: name, to: "Todos", text: "entra na sala...", type: "status", time: time });
      res.sendStatus(201);
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});
app.get("/participants", async (req, res) => {
  try {
    const participants = await db.collection("participants").find().toArray();
    res.status(200).send(participants);
  } catch (err) {
    res.status(422).send({ message: err.message });
  }
});
app.post("/messages", async (req, res) => {
  const { to, text, type } = req.body;
  const userName = req.headers.user || req.headers.User;
  try {
    const userOnline = await db.collection("participants").findOne({ name: userName });
    const from = userOnline.name;
    const { error } = messageValidation.validate({ to, text, type, from });
    if (error) return res.status(422).send({ message: error.message });
    const time = dayjs().format("HH:mm:ss");
    await db.collection("messages").insertOne({ to, text, type, from, time });
    res.sendStatus(201);
  } catch (err) {
    return res.status(422).json({ message: err.message });
  }
});
app.get("/messages", async (req, res) => {
  const userName = req.headers.user || req.headers.User;
  const { limit } = req.query;
  const { error } = numberValidation.validate({ limit });
  try {
    let availableMessages;
    if (error) {
      availableMessages = await db
        .collection("messages")
        .find({ $or: [{ to: "Todos" }, { to: userName }, { from: userName }] })
        .toArray();
      return res.status(422).send(availableMessages);
    } else {
      const limitNumber = parseInt(limit);
      availableMessages = await db
        .collection("messages")
        .find({ $or: [{ to: "Todos" }, { to: userName }, { from: userName }] })
        .limit(limitNumber)
        .toArray();
      return res.status(200).send(availableMessages);
    }
  } catch (error) {
    res.status(422).send({ message: error.message });
  }
});
app.post("/status", async (req, res) => {
  const name = req.headers.user || req.headers.User;
  const { error } = userValidation.validate({ name });
  if (error) return res.status(404).send({ message: error.message });
  try {
    const userOnline = await db.collection("participants").findOne({ name: name });
    if (userOnline) {
      await db.collection("participants").updateOne({ name: name }, { $set: { lastStatus: Date.now() } });
      return res.sendStatus(200);
    } else {
      return res.status(404).send({ message: error.message });
    }
  } catch (err) {
    res.status(404).send({ message: err.message });
  }
});

app.listen(PORT);