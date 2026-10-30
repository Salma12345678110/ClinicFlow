
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const pool = require('../src/config/db');
const bcrypt = require('bcrypt');

jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  end: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('Authentification - Tests Login', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Refuser la connexion sans email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Test123' });

    expect(response.status).toBe(400);
  });

  test('Refuser la connexion sans mot de passe', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' });

    expect(response.status).toBe(400);
  });

  test('Refuser un email inexistant', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'inconnu@example.com',
        password: 'Test123',
      });

    expect(response.status).toBe(401);
  });

  test('Refuser un mot de passe incorrect', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{
        id: '123',
        full_name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hash-fictif',
        role: 'staff',
      }],
    });

    bcrypt.compare.mockResolvedValueOnce(false);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Mauvais123',
      });

    expect(response.status).toBe(401);
  });

  test('Accepter une connexion avec des identifiants corrects', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{
        id: '123',
        full_name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hash-fictif',
        role: 'staff',
      }],
    });

    bcrypt.compare.mockResolvedValueOnce(true);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Correct123',
      });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe('test@example.com');
  });

});

describe('Authentification - Tests GET /api/auth/me', () => {

  test('Refuser l’accès sans token', async () => {
    const response = await request(app)
      .get('/api/auth/me');

    expect(response.status).toBe(401);
  });

  test('Refuser un token invalide', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer faux-token');

    expect(response.status).toBe(401);
  });

  test('Récupérer les informations avec un token valide', async () => {
    const token = jwt.sign(
      { id: '123', role: 'staff' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    pool.query.mockResolvedValueOnce({
      rows: [{
        id: '123',
        full_name: 'Test User',
        email: 'test@example.com',
        role: 'staff',
      }],
    });

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.body.user.role).toBe('staff');
  });

});
