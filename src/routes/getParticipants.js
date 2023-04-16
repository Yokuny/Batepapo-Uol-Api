const getParticipants = async (req, res, db) => {
  try {
    const participants = await db.collection("participants").find().toArray();
    res.status(200).send(participants);
  } catch (err) {
    res.status(422).send({ message: err.message });
  }
};
export default getParticipants;
