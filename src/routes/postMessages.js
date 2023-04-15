import dayjs from "dayjs";
import { messageValidation } from "../scripts/validation.js";

const postMessages = async (req, res, db) => {
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
};
export default postMessages;
