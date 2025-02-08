import express from "express";
import { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import Redis from "ioredis";

const CACHE_TIME_SECONDS = 3600;

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const redis = new Redis();
const LUMEN_API_URL = process.env.LUMEN_API_URL || "http://localhost:8000";

app.get("/users", async (req: Request, res: Response): Promise<any> => {
  try {
    const cachedUsers = await redis.get("users");
    if (cachedUsers) return res.json(JSON.parse(cachedUsers));

    const response = await fetch(`${LUMEN_API_URL}/users`);
    const data = await response.json();
    await redis.setex("users", CACHE_TIME_SECONDS, JSON.stringify(data));

    res.json(data);
  } catch (error) {
    console.error("Error while getting users", error);
    res.status(500).json({ error: "Unable to get users." });
  }
});

app.get("/users/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.params.id;
    const cachedUser = await redis.get(`user:${userId}`);
    if (cachedUser) return res.json(JSON.parse(cachedUser));

    const response = await fetch(`${LUMEN_API_URL}/users/${userId}`);
    const data = await response.json();
    await redis.setex(
      `user:${userId}`,
      CACHE_TIME_SECONDS,
      JSON.stringify(data)
    );

    res.json(data);
  } catch (error) {
    console.error("Error while getting user", error);
    res.status(404).json({ error: "Could not find user." });
  }
});

app.post("/users", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const response = await fetch(`${LUMEN_API_URL}/register`, {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    await redis.del("users");

    res.status(201).json(await response.json());
  } catch (error) {
    console.error("Error while creating user", error);
    res.status(400).json({ error: "Error while creating user." });
  }
});

app.put("/users/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { name, email, password } = req.body;
    const response = await fetch(`${LUMEN_API_URL}/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    await redis.del("users");
    await redis.del(`user:${userId}`);

    res.json(await response.json());
  } catch (error) {
    console.error("Error while updating user", error);
    res.status(400).json({ error: "Error while updating user." });
  }
});

app.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const response = await fetch(`${LUMEN_API_URL}/users/${userId}`, {
      method: "DELETE",
    });

    await redis.del("users");
    await redis.del(`user:${userId}`);

    res.json(await response.json());
  } catch (error) {
    console.error("Error while deleting user", error);
    res.status(400).json({ error: "Error while deleting user." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Node API running on port ${PORT}`));
