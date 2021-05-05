const fs = require('fs')
const path = require('path')

/**
 * Provide the content of the empty initialized sqlite database.
 *
 * @return {Buffer}
 */
function empty() {
  return fs.readFileSync(path.join(__dirname, '/empty.sqlite'))
}

module.exports = {
  empty
}
