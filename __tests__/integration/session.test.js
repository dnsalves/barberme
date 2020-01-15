import app from '../../src/app';
// import truncate from '../util/truncate';

const supertest = require('supertest');

const request = supertest(app);

describe('Authenticating', () => {
  // beforeEach(async () => {
  //   await truncate();
  // });

  it('should not create a new session when validation fails', async done => {
    const res = await request.post('/sessions');

    expect(res.body).toHaveProperty('error', 'Validation Fails');
    expect(res.statusCode).toEqual(400);
    done();
  });

  it('should not create a new session when user not exists', async done => {
    const res = await request.post('/sessions').send({
      email: 'dns_alves@hotmail.com',
      password: '12345678',
    });

    expect(res.body).toHaveProperty('error', 'User not exists');
    expect(res.statusCode).toEqual(401);
    done();
  });

  it('should not create a new session when user password is invalid', async done => {
    await request.post('/users').send({
      name: 'Denis',
      email: 'dns_alves@hotmail.com',
      password: '12345678',
    });

    const res = await request.post('/sessions').send({
      email: 'dns_alves@hotmail.com',
      password: 'xxxxxxxxx',
    });

    expect(res.body).toHaveProperty('error', 'Password does not match');
    expect(res.statusCode).toEqual(401);
    done();
  });

  it('should user can auth', async done => {
    await request.post('/users').send({
      name: 'Denis',
      email: 'dns_alves@hotmail.com',
      password: '12345678',
    });

    const res = await request.post('/sessions').send({
      email: 'dns_alves@hotmail.com',
      password: '12345678',
    });

    expect(res.body.token).toBeTruthy();
    done();
  });
});
