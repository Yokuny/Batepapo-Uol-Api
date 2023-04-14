import express from "express";
import dotenv from "dotenv";
import dayjs from "dayjs";
import cors from "cors";
import joi from "joi";
import { MongoClient } from "mongodb";

const userValidation = joi.object({
  name: joi.string().min(1).required(),
});
const messageValidation = joi.object({
  to: joi.string().min(1).required(),
  text: joi.string().min(1).max(250).required(),
  type: joi.string().valid("message", "private_message").required(),
  from: joi.string().min(1).required(),
});
const numberValidation = joi.object({
  limit: joi.number().integer().min(1).required(),
});

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

const PORT = process.env.PORT || 5000;
const URI = process.env.DATABASE_URL;

const dbConnection = async () => {
  const database = new MongoClient(URI);
  try {
    await database.connect();
    return database.db();
  } catch (err) {
    console.log({ message: err.message });
  }
};
const db = await dbConnection();

const inactiveUser = async () => {
  const tenSecondsAgo = Date.now();
  try {
    const afk = await db
      .collection("participants")
      .find({
        lastStatus: { $lt: tenSecondsAgo - 10000 },
      })
      .toArray();
    console.log(afk);
    afk.forEach(async (user) => {
      const time = dayjs().format("HH:mm:ss");
      await db.collection("messages").insertOne({
        to: "Todos",
        text: "sai da sala...",
        type: "status",
        from: user.name,
        time: time,
      });
      await db.collection("participants").deleteOne({ name: user.name });
    });
  } catch (err) {
    console.log({ message: err.message });
  }
};
setInterval(inactiveUser, 15000);

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
      res.status(422).send(availableMessages);
    } else {
      const limitNumber = parseInt(limit);
      availableMessages = await db
        .collection("messages")
        .find({ $or: [{ to: "Todos" }, { to: userName }, { from: userName }] })
        .limit(limitNumber)
        .toArray();
      res.status(200).send(availableMessages);
    }
  } catch (error) {
    res.status(422).send({ message: error.message });
  }
});
app.post("/status", async (req, res) => {
  const userName = req.headers.user || req.headers.User;
  const { error } = userValidation.validate({ userName });
  if (error) return res.status(404).send({ message: error.message });
  try {
    const userOnline = await db.collection("participants").findOne({ name: userName });
    if (userOnline) {
      await db.collection("participants").updateOne({ name: userName }, { $set: { lastStatus: Date.now() } });
      return res.sendStatus(200);
    }
    res.sendStatus(400);
  } catch (err) {
    res.status(404).send({ message: err.message });
  }
});

app.listen(PORT);