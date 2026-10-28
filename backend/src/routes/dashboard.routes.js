
const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
} = require("../controllers/dashboard.controller");

// À adapter au chemin et au nom de ton middleware JWT existant.
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/stats", authMiddleware, getDashboardStats);

module.exports = router;
