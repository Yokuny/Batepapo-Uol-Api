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
    return res.status(422).send("Invalid data");
  } else {
    try {
      const usersDatabase = await db.collection("participants").findOne({ name: name });
      if (usersDatabase) {
        return res.status(409).send("User already exists");
      } else {
        await db.collection("participants").insertOne({ name: name, lastStatus: Date.now() });
        res.sendStatus(201);
      }
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
    const userOnline = await db.collection("participants").findOne({ name: user });
    const from = userOnline.name;
    const { err } = messageValidation.validate({ to, text, type, from });
    if (err) {
      return res.status(422).send("Invalid data");
    } else {
      try {
        const time = dayjs().format("HH:mm:ss");
        await db.collection("messages").insertOne({ to, text, type, from, time });
        res.sendStatus(201);
      } catch (err) {
        res.status(422).send("Internal server error");
      }
    }
  } catch (err) {
    return res.status(422).send("usuario não encontrado");
  }
});

app.get("/messages", async (req, res) => {
  //buscar msg publicas - remetente “Todos”
  //todas as msg enviadas "to" com o nome do usuário ou todas as com "from" e o nome do usuario
  //usar operador $and e $or mongodb
  const { user } = req.headers;
});

app.listen(5000);
