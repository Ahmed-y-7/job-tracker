import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

// GET /api/notes?application_id=123 — notes for one application
router.get("/", async (req, res) => {
  const { application_id } = req.query;
  if (!application_id) return res.status(400).json({ message: "application_id is required" });

  const result = await pool.query(
    `SELECT id, application_id, body, created_at
     FROM notes
     WHERE user_id = $1 AND application_id = $2
     ORDER BY created_at DESC`,
    [req.userId, application_id]
  );
  res.json(result.rows);
});

// POST /api/notes — add a note to an application
router.post("/", async (req, res) => {
  const { application_id, body } = req.body ?? {};
  if (!application_id || !body) {
    return res.status(400).json({ message: "application_id and body are required" });
  }

  const result = await pool.query(
    `INSERT INTO notes (application_id, user_id, body)
     VALUES ($1, $2, $3)
     RETURNING id, application_id, body, created_at`,
    [application_id, req.userId, body]
  );
  res.status(201).json(result.rows[0]);
});

// DELETE /api/notes/:id
router.delete("/:id", async (req, res) => {
  const result = await pool.query(
    "DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id",
    [req.params.id, req.userId]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: "Note not found" });
  res.json({ message: "Deleted", id: result.rows[0].id });
});

export default router;
