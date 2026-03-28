import express from "express";
import dotenv from "dotenv";
import { createRedisClient } from "./config/redis.js";
import { createLockRouter } from "./routes/locks.js";

dotenv.config();

const app = express();
const redis = createRedisClient();
const port = Number(process.env.PORT) || 3000;



app.use(express.json());

app.use(createLockRouter(redis));


app.get("/health", async (req, res) => {
    const ping = await redis.ping();
    res.status(200).json({ status: "ok", redis: ping });
});


app.listen(port, () => {
  console.log(`LockForge running on port ${port}`);
});
