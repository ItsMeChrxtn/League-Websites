const express = require("express");
const { loginAdmin, verifyAdmin } = require("../controllers/authController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/verify", protectAdmin, verifyAdmin);

module.exports = router;
