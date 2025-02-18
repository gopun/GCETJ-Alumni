const express = require("express");
const router = express.Router();

const controller = require("../controllers/admin");

router.get("/user", controller.getUserData);
router.post("/users", controller.getUsers);
router.put("/update-profile", controller.updateProfile);
router.patch("/change-status", controller.changeStatus);
router.patch("/make-admin", controller.makeAdmin);
router.delete("/delete-user", controller.deleteUser);

module.exports = router;
