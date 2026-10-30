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

const patientData = {
  full_name: 'Ahmed Benali',
  cin: 'AB123456',
  phone: '0612345678',
  birth_date: '1995-05-15',
  address: 'Fès',
};

describe('Patients - Tests PUT /api/patients/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Modifier un patient avec des données valides', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: patientId,
          ...patientData,
          full_name: 'Ahmed Benali Modifié',
        },
      ],
      rowCount: 1,
    });

    const response = await request(app)
      .put(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...patientData,
        full_name: 'Ahmed Benali Modifié',
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      'Patient modifié avec succès.'
    );
    expect(response.body.patient.full_name).toBe(
      'Ahmed Benali Modifié'
    );
  });

  test('Refuser un identifiant invalide', async () => {
    const response = await request(app)
      .put('/api/patients/123')
      .set('Authorization', `Bearer ${token}`)
      .send(patientData);

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
      .put(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(patientData);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      'Patient introuvable.'
    );
  });

  test('Refuser une CIN déjà utilisée', async () => {
    pool.query.mockRejectedValueOnce({
      code: '23505',
    });

    const response = await request(app)
      .put(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(patientData);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe(
      'Un patient avec cette CIN existe déjà.'
    );
  });
});