const path = require('path');

module.exports = {
  PORT: process.env.PORT || 3101,
  BASEURL: process.env.BASEURL || 'http://localhost:' + (process.env.PORT || '3101'),
  DBPATH: process.env.DBPATH || path.resolve(process.cwd(), 'databases'),
  SECRET: process.env.SECRET || 'oGBtRQBWIVUjnqw0nbmvbJ7zsd&67rtyr/r5fyft62',
  AUTO_LOGIN_USER: process.env.AUTO_LOGIN_USER || null
};
