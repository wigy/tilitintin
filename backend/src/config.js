const path = require('path');

module.exports = {
  PORT: process.env.PORT || 3001,
  BASEURL: process.env.BASEURL || 'http://localhost:' + (process.env.PORT || '3001'),
  DBPATH: process.env.DBPATH || path.resolve(process.cwd(), 'databases'),
  SECRET: process.env.SECRET || 'oGBtRQBWIVUjnqw0nbmvbJ7zsd&67rtyr/r5fyft62',
  AUTHENTICATION: process.env.AUTHENTICATION !== 'no',
  TILITIN_USER: process.env.TILITIN_USER || 'user',
  TILITIN_PASSWORD: process.env.TILITIN_PASSWORD || 'pass'
};
