const express = require("express");
const router = express.Router();

const controller = require("../controllers/user");
const { uploadMultiFields } = require("../middleware/uploadMiddleware");

router.get("/", controller.getUserData);
router.put(
  "/update-profile",
  uploadMultiFields([
    { name: "profile", maxCount: 1 },
    { name: "degree", maxCount: 1 },
  ]),
  controller.updateProfile
);

module.exports = router;
