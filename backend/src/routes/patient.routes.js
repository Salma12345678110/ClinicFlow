
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
const roleMiddleware = require("../middlewares/roleMiddleware");

// Toutes les routes nécessitent un token JWT valide
router.use(authMiddleware);

// Ajouter un patient
router.post("/", createPatient);

// Afficher les patients avec recherche et pagination
router.get("/", getPatients);

// Afficher un patient par son identifiant
router.get("/:id", getPatientById);

// Modifier un patient
router.put("/:id", updatePatient);

// Supprimer un patient : réservé à l'administrateur
router.delete("/:id", roleMiddleware("admin"), deletePatient);

module.exports = router;
