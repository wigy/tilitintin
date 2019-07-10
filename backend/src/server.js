const express = require('express');
const cors = require('cors');
const config = require('./config');
const app = express();
const dump = require('neat-dump');

app.use(dump.middleware());
app.use(cors());
app.use('/', require('./routes/index'));

app.listen(config.PORT, function () {
  dump.info('App listening on port ' + config.PORT);
});
