
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

describe('Authentification JWT - API Patients', () => {

  test('Refuser l’accès sans token', async () => {
    const response = await request(app).get('/api/patients');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token manquant ou invalide');
  });

  test('Refuser un token sans Bearer', async () => {
    const response = await request(app)
      .get('/api/patients')
      .set('Authorization', 'Token abc123');

    expect(response.status).toBe(401);
  });

  test('Refuser un token incorrect', async () => {
    const response = await request(app)
      .get('/api/patients')
      .set('Authorization', 'Bearer faux-token');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token invalide ou expiré');
  });

  test('Accepter un token JWT valide', async () => {
    const token = jwt.sign(
      { id: '123', role: 'staff' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const response = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).not.toBe(401);
  });

});
