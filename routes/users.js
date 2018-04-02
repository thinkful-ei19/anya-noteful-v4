'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const { User } = require('../models/user');

const router = express.Router();

router.use(bodyParser.json());

router.post('/users', (req, res, next) => {

  let {username, password, fullname = ''} = req.body;
  // Username and password come in pre-trimmed, otherwise we throw an error
  // before this
  fullname = fullname.trim();

  return User.hashPassword(password)
    .then(digest => {
      const newUser = {
        username,
        password: digest,
        fullname
      };
      return User.create(newUser);
    })
    .then(result => {
      return res.status(201).location(`/api/users/${result.id}`).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    });
});

module.exports = router;