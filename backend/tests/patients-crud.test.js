
const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  end: jest.fn(),
}));

const token = jwt.sign(
  { id: '123', role: 'staff' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

describe('Patients - Tests de création', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Ajouter un patient avec des données valides', async () => {
    const patient = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      full_name: 'Ahmed Benali',
      cin: 'AB123456',
      phone: '0612345678',
      birth_date: '1995-05-15',
      address: 'Fès',
    };

    pool.query.mockResolvedValueOnce({
      rows: [patient],
    });

    const response = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        full_name: patient.full_name,
        cin: patient.cin,
        phone: patient.phone,
        birth_date: patient.birth_date,
        address: patient.address,
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe(
      'Patient ajouté avec succès.'
    );
    expect(response.body.patient.cin).toBe('AB123456');
  });

  test('Refuser un patient sans nom', async () => {
    const response = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cin: 'AB123456',
        phone: '0612345678',
        birth_date: '1995-05-15',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Données du patient invalides.'
    );
  });

  test('Refuser une date de naissance invalide', async () => {
    const response = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        full_name: 'Ahmed Benali',
        cin: 'AB123456',
        phone: '0612345678',
        birth_date: '2025-15-40',
      });

    expect(response.status).toBe(400);
  });

  test('Refuser une CIN déjà utilisée', async () => {
    pool.query.mockRejectedValueOnce({
      code: '23505',
    });

    const response = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        full_name: 'Ahmed Benali',
        cin: 'AB123456',
        phone: '0612345678',
        birth_date: '1995-05-15',
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe(
      'Un patient avec cette CIN existe déjà.'
    );
  });

});
