const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const userRoutes = require("./user");
const { authenticateSession } = require("../middleware/authMiddleware");

router.use("/auth", authRoutes);
router.use("/user", authenticateSession, userRoutes);

module.exports = router;
