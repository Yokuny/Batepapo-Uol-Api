import dayjs from "dayjs";
import { userValidation } from "../scripts/validation.js";

const postParticipants = async (req, res, db) => {
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
};
export default postParticipants;
