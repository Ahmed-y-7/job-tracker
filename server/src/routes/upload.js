import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

// Make sure the uploads folder exists.
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Store files on disk with a unique, user-scoped name.
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume_${req.userId}_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MB

// POST /api/applications/:id/resume — multipart form, field name "resume"
router.post("/applications/:id/resume", upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const filePath = `/uploads/${req.file.filename}`;
  const result = await pool.query(
    "UPDATE applications SET resume_path = $1 WHERE id = $2 AND user_id = $3 RETURNING id, resume_path",
    [filePath, req.params.id, req.userId]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: "Application not found" });
  res.json(result.rows[0]);
});

export default router;
