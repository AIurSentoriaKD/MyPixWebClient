const express = require("express");
const router = express.Router();
const author_controller = require("../controllers/authors.controller");

router.get("/", (req, res) => {
  res.render("login", { log: 1 });
});

router.post("/login", author_controller.loginAuthor);

router.post("/register", author_controller.registerAuthor);

router.get("/logout", author_controller.logOut);

module.exports = router;
