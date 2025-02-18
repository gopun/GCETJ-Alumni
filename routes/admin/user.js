const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/user");

router.post("/", controller.getUsers);
router.get("/get-by-id", controller.getUserData);
router.put("/update-profile", controller.updateProfile);
router.patch("/change-status", controller.changeStatus);
router.patch("/make-admin", controller.makeAdmin);
router.delete("/delete-user", controller.deleteUser);

module.exports = router;
