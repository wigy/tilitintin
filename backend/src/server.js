const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');
const app = express();

global.d = require('neat-dump');

app.use(d.middleware());
app.use(bodyParser.json());
app.use(cors());
app.use('/', require('./routes/index'));

app.listen(config.PORT, function () {
  d.info('App listening on port ' + config.PORT);
});
