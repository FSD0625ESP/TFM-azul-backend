import jwt from "jsonwebtoken";

// Middleware para verificar que el usuario es admin
export default function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el usuario tiene rol de admin
    if (decoded.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin role required." });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Admin auth middleware error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
