
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboard.routes');
const patientRoutes = require('./routes/patient.routes');
const appointmentRoutes = require('./routes/appointment.routes');

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Route d'accueil
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Bienvenue sur l API ClinicFlow',
  });
});

// Routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);

// Route pour les endpoints inexistants
app.use((req, res) => {
  res.status(404).json({
    message: 'Route introuvable.',
  });
});

// Exporter l'application pour Supertest
module.exports = app;

// Démarrer le serveur uniquement en exécution directe
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  pool.query('SELECT NOW()')
    .then((result) => {
      console.log(
        'Base de données connectée !',
        result.rows[0]
      );
    })
    .catch((error) => {
      console.error(
        'Erreur de connexion à PostgreSQL :',
        error.message
      );
    });

  app.listen(PORT, () => {
    console.log(
      `Serveur ClinicFlow démarré sur le port ${PORT}`
    );
  });
}
