const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const pool = require('../src/config/db');

jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  end: jest.fn(),
}));

const adminToken = jwt.sign(
  { id: '123', role: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

const staffToken = jwt.sign(
  { id: '456', role: 'staff' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

const patientId = '550e8400-e29b-41d4-a716-446655440000';

describe('Patients - Tests DELETE /api/patients/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Supprimer un patient avec un compte admin', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: patientId }],
      rowCount: 1,
    });

    const response = await request(app)
      .delete(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      'Patient supprimé avec succès.'
    );
  });

  test('Refuser la suppression avec un compte staff', async () => {
    const response = await request(app)
      .delete(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(response.status).toBe(403);
  });

  test('Refuser un identifiant invalide', async () => {
    const response = await request(app)
      .delete('/api/patients/123')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Identifiant du patient invalide.'
    );
  });

  test('Retourner 404 si le patient est introuvable', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
    });

    const response = await request(app)
      .delete(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      'Patient introuvable.'
    );
  });

  test('Refuser la suppression si le patient possède des rendez-vous', async () => {
    pool.query.mockRejectedValueOnce({
      code: '23503',
    });

    const response = await request(app)
      .delete(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe(
      'Impossible de supprimer ce patient : il possède des rendez-vous.'
    );
  });
});