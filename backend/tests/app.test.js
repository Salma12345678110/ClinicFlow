
const request = require('supertest');
const app = require('../src/app');

describe('API ClinicFlow - Tests généraux', () => {

  test('GET / doit retourner le message de bienvenue', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      'Bienvenue sur l API ClinicFlow'
    );
  });

  test('Une route inexistante doit retourner 404', async () => {
    const response = await request(app).get('/route-inexistante');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Route introuvable.');
  });

});
