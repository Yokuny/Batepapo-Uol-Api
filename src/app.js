import express from "express";
const app = express();
import { userValidation } from "../script/joi.js";
import dbDatabase from "../script/db.js";
app.use(express.json());
const db = await dbDatabase();

app.post("/participants", async (req, res) => {
  const { name } = req.body;
  const { error } = userValidation.validate({ name });
  //validar conferindo se o nome ja esta cadastrado
  //caso esteja, retornar status 409
  if (error) {
    return res.status(400).send(error.details[0].message);
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

app.listen(5000);
