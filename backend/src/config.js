const path = require('path');

module.exports = {
  PORT: process.env.PORT || 3001,
  DB: process.env.DB || path.resolve(process.cwd(), 'tilitin.sqlite')
};
