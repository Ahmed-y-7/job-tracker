import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

// GET /api/reminders            — all reminders for the user
// GET /api/reminders?application_id=123 — reminders for one application
router.get("/", async (req, res) => {
  const { application_id } = req.query;
  const params = [req.userId];
  let where = "r.user_id = $1";

  if (application_id) {
    params.push(application_id);
    where += ` AND r.application_id = $${params.length}`;
  }

  const result = await pool.query(
    `SELECT r.id, r.application_id, r.title, r.remind_at, r.done,
            a.role, c.name AS company_name
     FROM reminders r
     JOIN applications a ON a.id = r.application_id
     LEFT JOIN companies c ON c.id = a.company_id
     WHERE ${where}
     ORDER BY r.remind_at`,
    params
  );
  res.json(result.rows);
});

// POST /api/reminders — schedule a reminder (e.g. an interview)
router.post("/", async (req, res) => {
  const { application_id, title, remind_at } = req.body ?? {};
  if (!application_id || !title || !remind_at) {
    return res.status(400).json({ message: "application_id, title and remind_at are required" });
  }

  const result = await pool.query(
    `INSERT INTO reminders (application_id, user_id, title, remind_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, application_id, title, remind_at, done`,
    [application_id, req.userId, title, remind_at]
  );
  res.status(201).json(result.rows[0]);
});

// PATCH /api/reminders/:id — mark done / not done
router.patch("/:id", async (req, res) => {
  const { done } = req.body ?? {};
  const result = await pool.query(
    "UPDATE reminders SET done = $1 WHERE id = $2 AND user_id = $3 RETURNING id, done",
    [!!done, req.params.id, req.userId]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: "Reminder not found" });
  res.json(result.rows[0]);
});

// DELETE /api/reminders/:id
router.delete("/:id", async (req, res) => {
  const result = await pool.query(
    "DELETE FROM reminders WHERE id = $1 AND user_id = $2 RETURNING id",
    [req.params.id, req.userId]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: "Reminder not found" });
  res.json({ message: "Deleted", id: result.rows[0].id });
});

export default router;
