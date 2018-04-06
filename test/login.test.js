'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { TEST_MONGODB_URI } = require('../config'); ('../config');

const User = require('../models/user');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

describe.only('Noteful API - Login', function () {
  let token;
  const fullname = 'Example User';
  const username = 'exampleUser';
  const password = 'examplePass2';

  //const { _id: id, username, fullname} = seedUser[0];

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return User.hashPassword(password)
      .then(digest => User.create({
        _id: '5ac7975b7979502b64142e40',
        username,
        password: digest,
        fullname
      }));
  });

  afterEach(function () {
    return User.remove();
    // alternatively you can drop the DB
    // return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  it('Should return a valid auth token', function () {
    return chai
      .request(app)
      .post('/api/login')
      .send({ username, password })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.authToken).to.be.a('string');
  
        const payload = jwt.verify(res.body.authToken, JWT_SECRET);
  
        expect(payload.user).to.not.have.property('password');
        expect(payload.user).to.deep.equal({ 
          'id': '5ac7975b7979502b64142e40',
          'fullname': 'Example User',
          'username': 'exampleUser',
        });
      });
  });

  it('Should reject requests with no credentials', function () {
    return chai
      .request(app)
      .post('/api/login')
      .then(() => 
        expect.fail(null, null, 'Request should not succeed'))
      .catch(err => {
        const res = err.response;
        expect(res).to.have.status(400);
      });
  });

  it('Should reject requests with incorrect usernames', function () {
    return chai
      .request(app)
      .post('/api/login')
      .send({ username: 'blablabla', password})
      .then(() =>
        expect.fail(null, null, 'Request should not succeed'))
      .catch(err => {
        const res = err.response;
        expect(res).to.have.status(401);
      });
  });

  it('Should reject requests with incorrect passwords', function () {
    return chai
      .request(app)
      .post('/api/login')
      .send({ username, password: 'blablabla'})
      .then(() =>
        expect.fail(null, null, 'Request should not succeed'))
      .catch(err => {
        const res = err.response;
        expect(res).to.have.status(401);
      });
  });



});