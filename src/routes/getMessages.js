import dbDatabase from "../../script/db.js";
const db = await dbDatabase();

const getmessages = async (req, res) => {
  const { user } = req.headers;
  try {
    const availableMessages = await db
      .collection("messages")
      .find({ $or: [{ to: "Todos" }, { to: user }, { from: user }] })
      .toArray();
    res.status(200).send(availableMessages);
  } catch (err) {
    res.status(422).send("Internal server error");
  }
};
export default getmessages;
