import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const key = process.env.DATABASE_URL;

const dbDatabase = async () => {
  try {
    await mongoose.connect(key, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    const database = mongoose.connection.db;
    return database;
  } catch (err) {
    console.error(err);
  }
};
export default dbDatabase;
