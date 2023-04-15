import { userValidation } from "../scripts/validation.js";

const postStatus = async (req, res, db) => {
  const name = req.headers.user || req.headers.User;
  const { error } = userValidation.validate({ name });
  if (error) return res.status(404).send({ message: error.message });
  try {
    const userOnline = await db.collection("participants").findOne({ name: name });
    if (userOnline) {
      await db.collection("participants").updateOne({ name: name }, { $set: { lastStatus: Date.now() } });
      return res.sendStatus(200);
    } else {
      return res.status(404).send({ message: error.message });
    }
  } catch (err) {
    res.status(404).send({ message: err.message });
  }
};
export default postStatus;
