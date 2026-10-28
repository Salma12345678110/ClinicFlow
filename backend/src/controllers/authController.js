const authService = require('../services/authService');
const pool = require('../config/db');

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email et mot de passe obligatoires',
      });
    }

    const result = await authService.login(email, password);

    if (!result) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect',
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur login :', error);
    return res.status(500).json({
      message: 'Erreur interne du serveur',
    });
  }
}

async function me(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, role
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Utilisateur introuvable',
      });
    }

    const user = result.rows[0];

    return res.status(200).json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erreur auth/me :', error);
    return res.status(500).json({
      message: 'Erreur interne du serveur',
    });
  }
}

module.exports = { login, me };