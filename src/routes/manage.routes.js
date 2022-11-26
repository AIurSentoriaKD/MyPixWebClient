// aca rutas de perfil comisiones y request
const express = require("express");
const router = express.Router();
const manage_controller = require("../controllers/manage.controller");

router.get("/solicitudes", manage_controller.req_comm);
router.get("/perfil", manage_controller.perfil);

module.exports = router;
