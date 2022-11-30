const express = require("express");
const router = express.Router();
const user_controller = require("../controllers/user.controller");

router.get("/:id_user", user_controller.User);

router.post("/post-commission", user_controller.postCommission)

module.exports = router;
