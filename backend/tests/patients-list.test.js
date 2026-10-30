
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

describe('Patients - Tests GET /api/patients', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Afficher la liste des patients', async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            full_name: 'Ahmed Benali',
            cin: 'AB123456',
            phone: '0612345678',
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ total: 1 }],
      });

    const response = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.patients).toHaveLength(1);
    expect(response.body.patients[0].full_name).toBe('Ahmed Benali');
    expect(response.body.pagination.total).toBe(1);
  });

  test('Afficher une liste vide lorsqu’aucun patient existe', async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [],
      })
      .mockResolvedValueOnce({
        rows: [{ total: 0 }],
      });

    const response = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.patients).toEqual([]);
    expect(response.body.pagination.total).toBe(0);
    expect(response.body.pagination.totalPages).toBe(0);
  });

  test('Appliquer la pagination', async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [],
      })
      .mockResolvedValueOnce({
        rows: [{ total: 25 }],
      });

    const response = await request(app)
      .get('/api/patients?page=2&limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.pagination.page).toBe(2);
    expect(response.body.pagination.limit).toBe(10);
    expect(response.body.pagination.total).toBe(25);
    expect(response.body.pagination.totalPages).toBe(3);
  });

  test('Gérer une erreur lors de la récupération des patients', async () => {
    pool.query.mockRejectedValueOnce(
      new Error('Erreur base de données')
    );

    const response = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe(
      'Erreur lors de la récupération des patients.'
    );
  });
});
