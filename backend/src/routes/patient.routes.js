
const express = require("express");
const router = express.Router();

const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} = require("../controllers/patient.controller");

const authMiddleware = require("../middlewares/authMiddleware");

// Toutes les routes nécessitent un token JWT
router.use(authMiddleware);

router.post("/", createPatient);
router.get("/", getPatients);
router.get("/:id", getPatientById);
router.put("/:id", updatePatient);
router.delete("/:id", deletePatient);

module.exports = router;
