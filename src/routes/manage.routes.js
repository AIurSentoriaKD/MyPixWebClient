// aca rutas de perfil comisiones y request
const express = require("express");
const router = express.Router();
const dashboard_controller = require("../controllers/dashboard.controller");

router.get("/comission", dashboard_controller.commission);

router.get("/request", dashboard_controller.request);

module.exports = router;
