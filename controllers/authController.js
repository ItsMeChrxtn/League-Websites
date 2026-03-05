const jwt = require("jsonwebtoken");

const loginAdmin = async (req, res) => {
  const { username, password } = req.body || {};

  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (username !== adminUsername || password !== adminPassword) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  const secret = process.env.JWT_SECRET || "league-default-secret-change-me";
  const token = jwt.sign(
    {
      role: "admin",
      username: adminUsername,
    },
    secret,
    { expiresIn: "12h" }
  );

  return res.json({
    token,
    admin: {
      username: adminUsername,
      role: "admin",
    },
  });
};

module.exports = {
  loginAdmin,
};
