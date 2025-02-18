const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/notification");

router.post("/upload-certificate", controller.uploadCertificate);

module.exports = router;
