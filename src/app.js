import express from "express";
import dbCollettion from "../script/db.js";
const app = express();
const db = await dbCollettion();

app.get("/", async (req, res) => {
  try {
    const result = await db.find().toArray();
    res.json(result);
  } catch (err) {
    console.log(err);
  }
});

app.listen(5000);
