import { numberValidation } from "../scripts/validation.js";

const getMessages = async (req, res, db) => {
  const userName = req.headers.user || req.headers.User;
  const { limit } = req.query;

  const { error } = numberValidation.validate({ limit });
  try {
    let availableMessages;
    if (error) {
      availableMessages = await db
        .collection("messages")
        .find({ $or: [{ to: "Todos" }, { to: userName }, { from: userName }] })
        .toArray();
      return res.status(422).send(availableMessages);
    } else {
      const limitNumber = parseInt(limit);
      availableMessages = await db
        .collection("messages")
        .find({ $or: [{ to: "Todos" }, { to: userName }, { from: userName }] })
        .limit(limitNumber)
        .toArray();
      return res.status(200).send(availableMessages);
    }
  } catch (error) {
    res.status(422).send({ message: error.message });
  }
};
export default getMessages;
