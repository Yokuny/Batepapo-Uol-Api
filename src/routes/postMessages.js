import dayjs from "dayjs";
import { stripHtml } from "string-strip-html";
import { messageValidation } from "../scripts/validation.js";

const sanitize = (dirtyTo, dirtyText, dirtyType, dirtyFrom) => {
  const time = dayjs().format("HH:mm:ss");
  const to = stripHtml(dirtyTo).result.trim();
  const text = stripHtml(dirtyText).result.trim();
  const type = stripHtml(dirtyType).result.trim();
  const from = stripHtml(dirtyFrom).result.trim();
  return { to, text, type, from, time };
};

const postMessages = async (req, res, db) => {
  const { to, text, type } = req.body;
  const name = req.headers.user || req.headers.User;
  const userName = stripHtml(name).result.trim();

  try {
    const userOnline = await db.collection("participants").findOne({ name: userName });
    const from = userOnline.name;

    const { error } = messageValidation.validate({ to, text, type, from });
    if (error) return res.status(422).send({ message: error.message });

    const message = sanitize(to, text, type, from);

    await db.collection("messages").insertOne(message);
    res.sendStatus(201);
  } catch (err) {
    return res.status(422).json({ message: err.message });
  }
};
export default postMessages;
