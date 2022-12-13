const express = require("express");
const router = express.Router();
const illust_controller = require("../controllers/illust.controller");

router.get("/illust", illust_controller.addIllust);

router.post("/submit_illust",illust_controller.submitIllust);

module.exports = router;