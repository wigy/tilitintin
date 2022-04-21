const express = require('express')
const cors = require('cors')
const config = require('./config')
const app = express()
const dump = require('neat-dump')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('../../api/openapi.json');

console.log(swaggerDocument);

app.use(dump.middleware())
app.use(cors())
app.options('*', cors())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/', require('./routes/index'))

app.listen(config.PORT, function () {
  dump.info('App listening on port ' + config.PORT)
})
