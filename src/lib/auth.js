import jwt from "jsonwebtoken";

export function signToken() {
  return jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "8h" });
}

export function requireAdmin(req) {
  const h = req.headers.get("authorization") || "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!t) return false;
  try {
    return jwt.verify(t, process.env.JWT_SECRET).role === "admin";
  } catch {
    return false;
  }
}