
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// Route d'accueil
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l API ClinicFlow' });
});

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Route protégée : récupérer l'utilisateur connecté
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({
    message: 'Utilisateur authentifié',
    user: req.user,
  });
});

// Vérifier la connexion PostgreSQL
pool.query('SELECT NOW()')
  .then((result) => {
    console.log('Base de données connectée !', result.rows[0]);
  })
  .catch((err) => {
    console.error('Erreur de connexion à PostgreSQL :', err.message);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur ClinicFlow démarré sur le port ${PORT}`);
});
