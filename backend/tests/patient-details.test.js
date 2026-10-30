
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const pool = require('../src/config/db');

jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  end: jest.fn(),
}));

const token = jwt.sign(
  { id: '123', role: 'staff' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

const patientId = '550e8400-e29b-41d4-a716-446655440000';

describe('Patients - Tests GET /api/patients/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Récupérer un patient avec un identifiant valide', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: patientId,
          full_name: 'Ahmed Benali',
          cin: 'AB123456',
          phone: '0612345678',
          birth_date: '1995-05-15',
          address: 'Fès',
        },
      ],
      rowCount: 1,
    });

    const response = await request(app)
      .get(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.patient.id).toBe(patientId);
    expect(response.body.patient.full_name).toBe('Ahmed Benali');
  });

  test('Refuser un identifiant invalide', async () => {
    const response = await request(app)
      .get('/api/patients/123')
      .set('Authorization', `Bearer ${token}`);

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
      .get(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Patient introuvable.');
  });

  test('Gérer une erreur de base de données', async () => {
    pool.query.mockRejectedValueOnce(
      new Error('Erreur base de données')
    );

    const response = await request(app)
      .get(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe(
      'Erreur lors de la récupération du patient.'
    );
  });
});
