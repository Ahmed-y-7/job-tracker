import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

// GET /api/companies
router.get("/", async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, website, notes, created_at FROM companies WHERE user_id = $1 ORDER BY name",
    [req.userId]
  );
  res.json(result.rows);
});

// POST /api/companies
router.post("/", async (req, res) => {
  const { name, website, notes } = req.body ?? {};
  if (!name) return res.status(400).json({ message: "name is required" });

  try {
    const result = await pool.query(
      `INSERT INTO companies (user_id, name, website, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, website, notes, created_at`,
      [req.userId, name, website || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// PUT /api/companies/:id
router.put("/:id", async (req, res) => {
  const { name, website, notes } = req.body ?? {};
  if (!name) return res.status(400).json({ message: "name is required" });

  const result = await pool.query(
    `UPDATE companies SET name = $1, website = $2, notes = $3
     WHERE id = $4 AND user_id = $5
     RETURNING id, name, website, notes, created_at`,
    [name, website || null, notes || null, req.params.id, req.userId]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: "Company not found" });
  res.json(result.rows[0]);
});

// DELETE /api/companies/:id
router.delete("/:id", async (req, res) => {
  const result = await pool.query(
    "DELETE FROM companies WHERE id = $1 AND user_id = $2 RETURNING id",
    [req.params.id, req.userId]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: "Company not found" });
  res.json({ message: "Deleted", id: result.rows[0].id });
});

export default router;
