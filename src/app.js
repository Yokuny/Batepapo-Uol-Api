import express from "express";
app.use(express.json());
const app = express();
import dayjs from "dayjs";
import dbDatabase from "../script/db.js";
import { userValidation, messageValidation } from "../script/joi.js";
const db = await dbDatabase();

app.post("/participants", async (req, res) => {
  const { name } = req.body;
  try {
    userValidation.validate({ name });
    //validar conferindo se o nome ja esta cadastrado
    //caso esteja, retornar status 409
    try {
      await db.collection("participants").insertOne({ name: name, lastStatus: Date.now() });
      res.status(201).send("Participant added");
    } catch (err) {
      res.status(422).send("Internal server error");
    }
  } catch (error) {
    return res.status(400).send(error.details[0].message);
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
    const userOnline = await db.collection("participants").find({ name: user }).toArray();
    const from = userOnline[0].name;
    messageValidation.validate({ to, text, type, from });
  } catch (err) {
    return res.status(422).send("error");
  }
});

app.listen(5000);
