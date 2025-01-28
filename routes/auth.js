const express = require("express");
const router = express.Router();

const auth = require("../controllers/auth");

router.post("/signup", auth.signup);
router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.post("/send-reset-password-link", auth.sendPasswordLink);
router.post("/reset-password/:token", auth.restPassword);

module.exports = router;
