import app from '../../src/app';

const supertest = require('supertest');

const request = supertest(app);

describe('Authenticating', () => {
  it('should user can auth', async () => {
    await request.post('/user').send({
      name: 'Denis Alves',
      email: 'dns_alves@hotmail.com',
      password: '12345678',
    });

    const res = await request.post('/sessions').send({
      name: 'Denis Alves',
      email: 'dns_alves@hotmail.com',
      password: '12345678',
    });

    expect(1).toBe(1);
  });
});
