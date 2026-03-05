const jwt = require("jsonwebtoken");

const protectAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: missing token" });
  }

  try {
    const secret = process.env.JWT_SECRET || "league-default-secret-change-me";
    const decoded = jwt.verify(token, secret);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: admin access only" });
    }

    req.admin = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
};

module.exports = { protectAdmin };
