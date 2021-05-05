const fs = require('fs')
const rp = require('request-promise')

class Tag {
  constructor(data = {}) {
    Object.assign(this, data)
  }
}

/**
 * Check if tags table is available.
 * @param {Knex} knex Knex-instance configured for the database.
 * @return {Promise<boolean>}
 */
function isReady(knex) {
  return knex.schema.hasTable('tags')
}

/**
 * Make sure that table for tags exists.
 * @param {Knex} knex Knex-instance configured for the database.
 * @return {Promise<true>}
 */
function ensure(knex) {
  return isReady(knex)
    .then((yes) => {
      if (yes) {
        return Promise.resolve(true)
      }
      return knex.schema.createTable('tags', function (table) {
        table.increments('id').primary()
        table.string('tag', 16).notNullable()
        table.string('name', 256).nullable()
        table.string('picture', 512).nullable()
        table.string('type', 16).nullable()
        table.integer('order')

        table.unique('tag')
        table.index('type')
        table.index('order')
      })
        .then(() => true)
    })
}

/**
 * Get all tags.
 * @param {Knex} knex Knex-instance configured for the database.
 */
function getAll(knex) {
  return ensure(knex)
    .then(() => {
      return knex.select('*').from('tags').orderBy('order')
    })
    .then((tags) => tags.map((tag) => new Tag(tag)))
}

/**
 * Get tags of certain types.
 * @param {string} db The database name without `.sqlite`.
 * @param {string[]} types Names of tag types.
 */
function getByTypes(knex, types) {
  return ensure(knex)
    .then(() => {
      return knex.select('*').from('tags').whereIn('type', types).orderBy('order')
    })
}

/**
 * Insert a tag.
 * @param {Knex} knex Knex-instance configured for the database.
 * @param {string} tag
 * @param {string} name
 * @param {string} picture
 * @param {string} type
 * @param {integer} order
 * @return {Promise}
 */
async function add(knex, tag, name, picture, type, order) {
  if (!/^[a-z]+:\/\//.test(picture)) {
    throw new Error('Please use file://full/path to local files.')
  }
  const url = new URL(picture)
  let mime
  if (/\.jpe?g$/i.test(url.pathname)) {
    mime = 'image/jpeg'
  }
  if (/\.png$/i.test(url.pathname)) {
    mime = 'image/png'
  }
  if (/\.svg$/i.test(url.pathname)) {
    mime = 'image/svg+xml'
  }
  if (!mime) {
    throw new Error('Cannot recognize MIME type.')
  }
  let blob
  switch (url.protocol) {
    case 'http:':
    case 'https:':
      blob = await rp({ uri: picture, encoding: null })
      break
    case 'file:':
      blob = fs.readFileSync(url.pathname)
      break
    default:
      throw new Error(`Cannot handle protocol '${url.protocol}'.`)
  }
  return ensure(knex)
    .then(() => {
      return knex('tags').insert({
        tag,
        mime,
        name,
        picture: blob,
        type,
        order
      })
    })
}

module.exports = {
  isReady,
  add,
  ensure,
  getAll,
  getByTypes
}
