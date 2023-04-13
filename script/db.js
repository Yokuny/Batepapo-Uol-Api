import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const key = process.env.DATABASE_URL;

const dbDatabase = async () => {
  const mongoClient = new MongoClient(key);
  try {
    const connection = await mongoClient.connect();

    const database = connection.db;
    return database;
  } catch (err) {
    console.error(err);
  }
};
export default dbDatabase;
