import dbDatabase from "../../script/db.js";
const db = await dbDatabase();

const getParticipants = async (req, res) => {
  try {
    const participants = await db.collection("participants").find().toArray();
    res.status(200).send(participants);
  } catch (err) {
    res.status(422).send({ message: err.message });
  }
};
export default getParticipants;
