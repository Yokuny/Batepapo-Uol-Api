import express from "express";
const app = express();
import dayjs from "dayjs";
import dbDatabase from "../script/db.js";
import { userValidation, messageValidation } from "../script/joi.js";

app.use(express.json());
const db = await dbDatabase();

app.post("/participants", async (req, res) => {
  const { name } = req.body;
  const { error } = userValidation.validate({ name });
  if (error) {
    return res.status(400).send({ message: err.message });
  } else {
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
      res.status(500).send("Internal server error");
    }
  }
});

app.get("/participants", async (req, res) => {
  try {
    const participants = await db.collection("participants").find().toArray();
    res.status(200).send(participants);
  } catch (err) {
    res.status(422).send("Internal server error");
  }
});

app.post("/messages", async (req, res) => {
  const { to, text, type } = req.body;
  const { user } = req.headers;
  try {
    const userOnline = await db.collection("participants").findOne({ name: user });
    const from = userOnline.name;
    const { err } = messageValidation.validate({ to, text, type, from });
    if (err) {
      return res.status(422).send("Invalid data");
    } else {
      const time = dayjs().format("HH:mm:ss");
      await db.collection("messages").insertOne({ to, text, type, from, time });
      res.sendStatus(201);
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.get("/messages", async (req, res) => {
  const { user } = req.headers;
  try {
    const availableMessages = await db
      .collection("messages")
      .find({ $or: [{ to: "Todos" }, { to: user }, { from: user }] })
      .toArray();
    res.status(200).send(availableMessages);
  } catch (err) {
    res.status(422).send("Internal server error");
  }
});

app.listen(5000);
