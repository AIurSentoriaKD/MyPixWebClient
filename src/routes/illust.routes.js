const express = require("express");
const router = express.Router();
const illust_controller = require("../controllers/illust.controller");

router.get("/:id", illust_controller.getOneIllust);


module.exports = router;