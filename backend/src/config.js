const path = require('path');

module.exports = {
  PORT: process.env.PORT || 3001,
  BASEURL: process.env.BASEURL || 'http://localhost:3001',
  DBPATH: process.env.DBPATH || path.resolve(process.cwd(), 'databases'),
  SECRET: process.env.SECRET || 'oGBtRQBWIVUjnqw0nbmvbJ7zsd&67rtyr/r5fyft62',
  AUTHENTICATION: true,
  TILITIN_USER: process.env.USER || 'user',
  TILITIN_PASSWORD: process.env.PASSWORD || 'pass'
};
