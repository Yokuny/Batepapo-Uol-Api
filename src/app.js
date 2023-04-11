import express from "express";
const app = express();
import dayjs from "dayjs";
import dbDatabase from "../script/db.js";
import { userValidation, messageValidation } from "../script/joi.js";

app.use(express.json());
const db = await dbDatabase();

app.post("/participants", async (req, res) => {
  const { name } = req.body;
  const { err } = userValidation.validate({ name });

  if (err) {
    console.log("> POST/participants > err");
    console.log(err);
    return res.status(400).send("error");
  } else {
    try {
      await db.collection("participants").insertOne({ name: name, lastStatus: Date.now() });
      res.status(201).send("Participant added");
    } catch (err) {
      res.status(422).send("Internal server error");
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
    //try para conferir se o usuário existe no banco de dados
    const userOnline = await db.collection("participants").find({ name: user }).toArray();
    const from = userOnline[0].name;
    const { err } = messageValidation.validate({ to, text, type, from });
    if (err) {
      console.log("> POST/messages > err");
      console.log(err);
      return res.status(422).send("error");
    } else {
      try {
        const time = dayjs().format("HH:mm:ss");
        await db.collection("messages").insertOne({ to, text, type, user, time });
        res.status(201).send("Message sent");
      } catch (err) {
        res.status(422).send("Internal server error");
      }
    }
  } catch (err) {
    return res.status(422).send("usuario não encontrado");
  }
});

app.listen(5000);
