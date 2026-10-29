const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
} = require("../controllers/appointment.controller");

const authMiddleware = require("../middlewares/authMiddleware");

// Toutes les routes nécessitent un token JWT valide.
router.use(authMiddleware);

router.post("/", createAppointment);
router.get("/", getAppointments);
router.patch("/:id/status", updateAppointmentStatus);

module.exports = router;