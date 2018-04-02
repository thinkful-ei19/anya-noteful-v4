'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userSchema = new mongoose.Schema({
  fullname: { type: String},
  username: { type: String, unique: true, required: true},
  password: { type: String, required: true}
});