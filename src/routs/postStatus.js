import dbDatabase from "../../script/db.js";
const db = await dbDatabase();

import { userValidation } from "../../script/joi.js";

const postStatus = async (req, res) => {
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
};
export default postStatus;
