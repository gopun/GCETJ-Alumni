const express = require("express");
const router = express.Router();

const userRoutes = require("./user");
const notificationRoutes = require("./notification");

router.use("/users", userRoutes);
router.use("/notification", notificationRoutes);

module.exports = router;
