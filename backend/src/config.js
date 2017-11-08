const path = require('path');

module.exports = {
  PORT: process.env.PORT || 3001,
  BASEURL: process.env.BASEURL || 'http://localhost:3001',
  DB: process.env.DB || path.resolve(process.cwd(), 'tilitin.sqlite'),
};
