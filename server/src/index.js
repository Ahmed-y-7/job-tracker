import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import authRouter from "./routes/auth.js";
import companiesRouter from "./routes/companies.js";
import applicationsRouter from "./routes/applications.js";
import notesRouter from "./routes/notes.js";
import remindersRouter from "./routes/reminders.js";
import uploadRouter from "./routes/upload.js";
import { requireAuth } from "./middleware/auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Job Tracker API is running" });
});

app.get("/api/db-check", async (_req, res) => {
  try {
    const result = await pool.query("SELECT now()");
    res.json({ status: "ok", dbTime: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "DB connection failed" });
  }
});

// Authentication routes: /api/auth/signup and /api/auth/login
app.use("/api/auth", authRouter);

// Core data routes (each requires a valid token, enforced inside the router)
app.use("/api/companies", companiesRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/notes", notesRouter);
app.use("/api/reminders", remindersRouter);

// Serve uploaded resume files, and handle resume uploads.
app.use("/uploads", express.static("uploads"));
app.use("/api", uploadRouter);

// Protected route to verify the token works.
app.get("/api/me", requireAuth, async (req, res) => {
  const result = await pool.query(
    "SELECT id, email, name, created_at FROM users WHERE id = $1",
    [req.userId]
  );
  res.json(result.rows[0]);
});

// 404 for unknown routes
app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Central error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
