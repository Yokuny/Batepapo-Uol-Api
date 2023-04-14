import express from "express";
import dotenv from "dotenv";
import dayjs from "dayjs";
import cors from "cors";
import joi from "joi";
import MongoClient from "mongodb";

const userValidation = joi.object({
  name: joi.string().min(2).max(30).required(),
});
const messageValidation = joi.object({
  to: joi.string().min(2).max(30).required(),
  text: joi.string().min(2).max(250).required(),
  type: joi.string().valid("message", "private_message").required(),
  from: joi.string().min(2).max(30).required(),
});

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

const PORT = process.env.PORT || 5000;
const URI = process.env.DATABASE_URL;

const startDB = async () => {
  const mongoClient = new MongoClient(URI);
  try {
    await mongoClient.connect();
    return mongoClient.db();
  } catch {
    console.log("error iniciar db");
  }
};
const db = await startDB();
setInterval(inactiveUser, 15000);

app.post("/participants", async (req, res) => {
  const { name } = req.body;
  const { error } = userValidation.validate({ name });
  if (error) {
    return res.status(422).send({ message: error.message });
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
      res.status(500).send({ message: err.message });
    }
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
    if (error) {
      return res.status(422).send({ message: error.message });
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
  const userName = req.headers.user || req.headers.User;
  try {
    const availableMessages = await db
      .collection("messages")
      .find({ $or: [{ to: "Todos" }, { to: userName }, { from: userName }] })
      .toArray();
    res.status(200).send(availableMessages);
  } catch (err) {
    res.status(422).send("Internal server error");
  }
});
app.post("/status", async (req, res) => {
  const { user } = req.headers;
  const { error } = userValidation.validate({ user });
  if (error) return res.status(404).send({ message: error.message });
  try {
    const userOnline = await db.collection("participants").findOne({ name: user });
    if (userOnline) {
      await db.collection("participants").updateOne({ name: user }, { $set: { lastStatus: Date.now() } });
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

const inactiveUser = async () => {
  const tenSecondsAgo = Date.now();
  try {
    const afk = await db
      .collection("participants")
      .find({
        lastStatus: { $lt: tenSecondsAgo - 10000 },
      })
      .toArray();
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

app.listen(PORT);