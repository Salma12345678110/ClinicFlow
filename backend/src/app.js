const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l API ClinicFlow',
  });
});

app.use('/api/auth', authRoutes);

pool.query('SELECT NOW()')
  .then((result) => {
    console.log('Base de données connectée !', result.rows[0]);
  })
  .catch((error) => {
    console.error(
      'Erreur de connexion à PostgreSQL :',
      error.message
    );
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur ClinicFlow démarré sur le port ${PORT}`);
});