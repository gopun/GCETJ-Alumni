const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const userRoutes = require("./user");
const adminRoutes = require("./admin");
const {
  authenticateSession,
  authenticateAdminSession,
} = require("../middleware/authMiddleware");

router.use("/auth", authRoutes);
router.use("/user", authenticateSession, userRoutes);
router.use(
  "/admin",
  authenticateSession,
  authenticateAdminSession,
  adminRoutes
);

module.exports = router;
