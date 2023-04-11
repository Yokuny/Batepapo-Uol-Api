import dotenv from "dotenv";
dotenv.config();
const database = process.env.DATABASE;
import { MongoClient, ServerApiVersion } from "mongodb";
const client = new MongoClient(database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const dbCollettion = async () => {
  await client.connect();
  const collection = client.db("oul").collection("oul");
  return collection;
};
export default dbCollettion;
