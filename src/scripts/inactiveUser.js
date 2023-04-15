import dayjs from "dayjs";

const inactiveUser = async (db) => {
  const tenSecondsAgo = Date.now();
  try {
    const afk = await db
      .collection("participants")
      .find({
        lastStatus: { $lt: tenSecondsAgo - 10000 },
      })
      .toArray();
    afk.forEach(async (user) => {
      const time = dayjs().format("HH:mm:ss");
      await db.collection("messages").insertOne({
        to: "Todos",
        text: "sai da sala...",
        type: "status",
        from: user.name,
        time: time,
      });
      await db.collection("participants").deleteOne({ name: user.name });
    });
  } catch (err) {
    console.log({ message: err.message });
  }
};
export default inactiveUser;
