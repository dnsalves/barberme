import app from '../../src/app';
import truncate from '../util/truncate';

const supertest = require('supertest');

const request = supertest(app);

describe('Creating users', () => {
  //   beforeEach(async () => {
  //     await truncate();
  //   });

  it('should not create a new user when validation fails', async done => {
    const res = await request.post('/users');

    expect(res.body).toHaveProperty('error', 'Validation Fails');
    expect(res.statusCode).toEqual(400);
    done();
  });

  it('should not create a new user when user exists', async done => {
    await request.post('/users').send({
      name: 'Denis Alves',
      email: 'dns_alves@hotmail.com',
      password: '12345678',
    });

    const res = await request.post('/users').send({
      name: 'Denis Alves',
      email: 'dns_alves@hotmail.com',
      password: '12345678',
    });

    expect(res.body).toHaveProperty('error', 'User already exists');
    expect(res.statusCode).toEqual(400);
    done();
  });

  it('should create a new user', async done => {
    await truncate();

    const res = await request.post('/users').send({
      name: 'Denis Alves',
      email: 'dns_alves@hotmail.com',
      password: '12345678',
    });

    expect(res.statusCode).toEqual(200);
    done();
  });
});

describe('Updating users', () => {
  it('should not update a user when email already exists', async done => {
    // user 1
    await request.post('/users').send({
      name: 'Denis Alves',
      email: 'dns_alves@hotmail.com',
      password: '12345678',
    });

    // user 2
    await request.post('/users').send({
      name: 'Denis Alves',
      email: 'dns_alves2@hotmail.com',
      password: '12345678',
    });

    // login user 1
    const ses = await request.post('/sessions').send({
      email: 'dns_alves@hotmail.com',
      password: '12345678',
    });

    // update user 1
    const res = await request
      .put('/users')
      .send({
        name: 'Denis Alves',
        email: 'dns_alves2@hotmail.com',
      })
      .set('Authorization', `Bearer ${ses.body.token}`);

    expect(res.body).toHaveProperty('error', 'User already exists');
    expect(res.statusCode).toEqual(400);
    done();
  });

  it('should not update a user when validation fails', async done => {
    // user 1
    await request.post('/users').send({
      name: 'Denis Alves',
      email: 'dns_alves@hotmail.com',
      password: '12345678',
    });

    // login user 1
    const ses = await request.post('/sessions').send({
      email: 'dns_alves@hotmail.com',
      password: '12345678',
    });

    const res = await request
      .put('/users')
      .send({ password: '123' })
      .set('Authorization', `Bearer ${ses.body.token}`);

    expect(res.body).toHaveProperty('error', 'Validation Fails');
    expect(res.statusCode).toEqual(400);
    done();
  });

  it('should not update a user when old password does not match', async done => {
    // user 1
    await request.post('/users').send({
      name: 'Denis Alves',
      email: 'dns_alves@hotmail.com',
      password: '12345678',
    });

    // login user 1
    const ses = await request.post('/sessions').send({
      email: 'dns_alves@hotmail.com',
      password: '12345678',
    });

    const res = await request
      .put('/users')
      .send({
        email: 'dns_alves@hotmail.com',
        password: '123456789',
        confirmPassword: '123456789',
        oldPassword: 'xxxxxxxx',
      })
      .set('Authorization', `Bearer ${ses.body.token}`);

    expect(res.body).toHaveProperty('error', 'Password does not match');
    expect(res.statusCode).toEqual(401);
    done();
  });

  it('should update a user', async done => {
    // create user
    await request.post('/users').send({
      name: 'Denis Alves',
      email: 'dns_alves@hotmail.com',
      password: '12345678',
    });

    // login user
    const ses = await request.post('/sessions').send({
      email: 'dns_alves@hotmail.com',
      password: '12345678',
    });

    const res = await request
      .put('/users')
      .send({
        password: '123456789',
        confirmPassword: '123456789',
        oldPassword: '12345678',
      })
      .set('Authorization', `Bearer ${ses.body.token}`);

    // expect(res.body).toHaveProperty('error', 'Password does not match');
    console.log(res.body);

    expect(res.statusCode).toEqual(200);
    done();
  });
});
