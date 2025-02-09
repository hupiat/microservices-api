import express from "express";
import { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import Redis from "ioredis";
import jwt from "jsonwebtoken";

const CACHE_TIME_SECONDS = 3600;

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const redis = new Redis();
const LUMEN_API_URL = process.env.LUMEN_API_URL || "http://localhost:8000";
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// POST - Login
app.post(
  "/api/users/login",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { email, password } = req.body;

      const response = await fetch(`${LUMEN_API_URL}/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        return res.status(response.status).json(await response.json());
      }

      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

      await redis.set(`session:${email}`, token, "EX", CACHE_TIME_SECONDS);

      res.json({ token });
    } catch (error) {
      console.error("Error while logging in", error);
      res.status(500).json({ error: "Error while logging in." });
    }
  }
);

// Middleware to protect routes
const authenticate = async (
  req: Request,
  res: Response,
  next: any
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const cachedToken = await redis.get(`session:${decoded.email}`);

    if (!cachedToken || cachedToken !== token) {
      res.status(401).json({ error: "Session expired. Please login again." });
      return;
    }

    req.body.user = decoded;
    next();
  } catch (error) {
    console.error("Error while authenticating", error);
    res.status(401).json({ error: "Unauthorized" });
  }
};

// DELETE - Logout
app.delete(
  "/api/users/logout",
  authenticate,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const decoded: any = jwt.verify(token, JWT_SECRET);

      if (decoded.email) {
        await redis.del(`session:${decoded.email}`);
      }

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Error while logging out", error);
      res.status(500).json({ error: "Error while logging out." });
    }
  }
);

// GET ALL

app.get(
  "/api/users",
  authenticate,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const cachedUsers = await redis.get("users");
      if (cachedUsers) return res.json(JSON.parse(cachedUsers));

      const response = await fetch(`${LUMEN_API_URL}/users`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${req.headers.authorization}`,
        },
      });

      const data = await response.json();
      await redis.setex("users", CACHE_TIME_SECONDS, JSON.stringify(data));

      res.json(data);
    } catch (error) {
      console.error("Error while getting users", error);
      res.status(500).json({ error: "Unable to get users." });
    }
  }
);

// GET BY ID

app.get(
  "/api/users/:id",
  authenticate,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = req.params.id;
      const cachedUser = await redis.get(`user:${userId}`);
      if (cachedUser) return res.json(JSON.parse(cachedUser));

      const response = await fetch(`${LUMEN_API_URL}/users/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${req.headers.authorization}`,
        },
      });
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
  }
);

// POST

app.post("/api/users", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const response = await fetch(`${LUMEN_API_URL}/register`, {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${req.headers.authorization}`,
      },
    });
    await redis.del("users");
    console.log(response.body);
    res.status(201).json(await response.json());
  } catch (error) {
    console.error("Error while creating user", error);
    res.status(400).json({ error: "Error while creating user." });
  }
});

// PUT

app.put("/api/users/:id", authenticate, async (req: Request, res: Response) => {
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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${req.headers.authorization}`,
      },
    });

    await redis.del("users");
    await redis.del(`user:${userId}`);

    res.json(await response.json());
  } catch (error) {
    console.error("Error while updating user", error);
    res.status(400).json({ error: "Error while updating user." });
  }
});

// DELETE

app.delete(
  "/api/users/:id",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const response = await fetch(`${LUMEN_API_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${req.headers.authorization}`,
        },
      });

      await redis.del("users");
      await redis.del(`user:${userId}`);

      res.json(await response.json());
    } catch (error) {
      console.error("Error while deleting user", error);
      res.status(400).json({ error: "Error while deleting user." });
    }
  }
);

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Node API running on port ${PORT}`));
}

export default app;
