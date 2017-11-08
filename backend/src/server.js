const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');
const app = express();

global.d = require('neat-dump');

app.use(d.middleware());
app.use(bodyParser.json());
app.use(cors());
app.get('/', (req, res) => {
  res.redirect('/period/');
});
app.use('/period', require('./routes/period'));
app.use('/account', require('./routes/account'));
app.use('/document', require('./routes/document'));
app.use('/entry', require('./routes/entry'));

app.listen(config.PORT, function () {
  d.info('App listening on port ' + config.PORT);
});
