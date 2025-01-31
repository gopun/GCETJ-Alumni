const express = require("express");
const router = express.Router();

const controller = require("../controllers/user");
// const { uploadMultiFields } = require("../middleware/uploadMiddleware");

router.get("/", controller.getUserData);
router.put("/update-profile", controller.updateProfile);

module.exports = router;
