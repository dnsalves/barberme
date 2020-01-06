import app from '../../src/app';
import truncate from '../util/truncate';

const supertest = require('supertest');

const request = supertest(app);

describe('Users', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should not create a new user when validation fails', async done => {
    const res = await request.post('/user');

    expect(res.body).toHaveProperty('error', 'Validation Fails');
    expect(res.statusCode).toEqual(400);
    done();
  });

  it('should create a new user', async done => {
    const res = await request.post('/user').send({
      name: 'Denis Alves',
      email: 'dns_alves@hotmail.com',
      password: '12345678',
    });

    expect(res.statusCode).toEqual(200);
    done();
  });

  // NOT WORKING
  it('should not create a new user when user exists', async done => {
    await request.post('/user').send({
      name: 'Denis Alves',
      email: 'dns_alves@hotmail.com',
      password: '12345678',
    });

    const res = await request.post('/user').send({
      name: 'Denis Alves',
      email: 'dns_alves@hotmail.com',
      password: '12345678',
    });

    expect(res.body).toHaveProperty('error', 'User already exists');
    expect(res.statusCode).toEqual(400);
    done();
  });
});
