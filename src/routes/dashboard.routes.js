const express = require("express");
const router = express.Router();
const dashboard_controller = require("../controllers/dashboard.controller");

router.get("/",dashboard_controller.indexmain);
router.get("/request", dashboard_controller.request)
router.get("/commission", dashboard_controller.commission)
router.get("/following", dashboard_controller.following);
router.get("/rankings", dashboard_controller.rankings);
module.exports = router;
