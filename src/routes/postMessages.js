import dbDatabase from "../../script/db.js";
import dayjs from "dayjs";
const db = await dbDatabase();

import { messageValidation } from "../../script/joi.js";

const postMessages = async (req, res) => {
  const { to, text, type } = req.body;
  const { user } = req.headers;
  try {
    const userOnline = await db.collection("participants").findOne({ name: user });
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
};
export default postMessages;
