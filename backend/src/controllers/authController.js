
const authService = require('../services/authService');

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

module.exports = { login };
