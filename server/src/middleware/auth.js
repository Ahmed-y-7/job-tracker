import jwt from "jsonwebtoken";

// Checks for "Authorization: Bearer <token>" and attaches userId to the request.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const token = header.split(" ")[1];
  const secret = process.env.JWT_SECRET || "dev_secret";

  try {
    const payload = jwt.verify(token, secret);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
