import dotenv from "dotenv";
dotenv.config();
const key = process.env.DATABASE_URL;
import { MongoClient, ServerApiVersion } from "mongodb";
const client = new MongoClient(key, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const dbDatabase = async () => {
  await client.connect();
  const database = client.db("oul");
  return database;
};
export default dbDatabase;