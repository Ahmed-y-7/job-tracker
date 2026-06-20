import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

const STATUSES = ["wishlist", "applied", "interview", "offer", "rejected"];

// GET /api/applications — all of the user's applications, with company name.
// Ordered by status then sort_order so the frontend can group into Kanban columns.
router.get("/", async (req, res) => {
  const result = await pool.query(
    `SELECT a.id, a.role, a.status, a.job_url, a.location, a.salary,
            a.applied_on, a.sort_order, a.resume_path,
            a.company_id, c.name AS company_name, a.created_at
     FROM applications a
     LEFT JOIN companies c ON c.id = a.company_id
     WHERE a.user_id = $1
     ORDER BY a.status, a.sort_order, a.id`,
    [req.userId]
  );
  res.json(result.rows);
});

// POST /api/applications
router.post("/", async (req, res) => {
  const { role, company_id, status, job_url, location, salary, applied_on } = req.body ?? {};
  if (!role) return res.status(400).json({ message: "role is required" });
  const st = STATUSES.includes(status) ? status : "wishlist";

  try {
    const result = await pool.query(
      `INSERT INTO applications (user_id, company_id, role, status, job_url, location, salary, applied_on)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, role, status, job_url, location, salary, applied_on, sort_order, resume_path, company_id`,
      [req.userId, company_id || null, role, st, job_url || null, location || null, salary || null, applied_on || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// PUT /api/applications/:id — edit full details
router.put("/:id", async (req, res) => {
  const { role, company_id, status, job_url, location, salary, applied_on } = req.body ?? {};
  if (!role) return res.status(400).json({ message: "role is required" });
  const st = STATUSES.includes(status) ? status : "wishlist";

  const result = await pool.query(
    `UPDATE applications
     SET role = $1, company_id = $2, status = $3, job_url = $4,
         location = $5, salary = $6, applied_on = $7
     WHERE id = $8 AND user_id = $9
     RETURNING id, role, status, job_url, location, salary, applied_on, sort_order, resume_path, company_id`,
    [role, company_id || null, st, job_url || null, location || null, salary || null, applied_on || null, req.params.id, req.userId]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: "Application not found" });
  res.json(result.rows[0]);
});

// PATCH /api/applications/:id/move — change status + order (Kanban drag-and-drop)
router.patch("/:id/move", async (req, res) => {
  const { status, sort_order } = req.body ?? {};
  if (!STATUSES.includes(status)) return res.status(400).json({ message: "invalid status" });

  const result = await pool.query(
    `UPDATE applications SET status = $1, sort_order = $2
     WHERE id = $3 AND user_id = $4
     RETURNING id, status, sort_order`,
    [status, Number.isFinite(sort_order) ? sort_order : 0, req.params.id, req.userId]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: "Application not found" });
  res.json(result.rows[0]);
});

// DELETE /api/applications/:id
router.delete("/:id", async (req, res) => {
  const result = await pool.query(
    "DELETE FROM applications WHERE id = $1 AND user_id = $2 RETURNING id",
    [req.params.id, req.userId]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: "Application not found" });
  res.json({ message: "Deleted", id: result.rows[0].id });
});

export default router;
