const moment = require('moment')
const knex = require('./knex')
const tags = require('./tags')
const settings = require('./settings')

/**
 * Convert dash-separated string to camel case.
 * @param {String} name
 */
function camelCase(name) {
  return name.split('-').map((s) => s[0].toUpperCase() + s.substr(1)).join('')
}

/**
 * Construct rendering information object based on the code.
 * @param {String} code
 */
function code2item(code) {
  const ret = {
    tab: parseInt(code[2])
  }

  switch (code[0]) {
    case 'D':
      ret.accountDetails = true
      break
    case 'H':
      ret.required = true
      ret.hideTotal = true
      break
    case 'G':
      ret.hideTotal = true
      break
    case 'S':
      ret.required = true
      break
    case 'T':
      break
  }

  switch (code[1]) {
    case 'B':
      ret.bold = true
      break
    case 'I':
      ret.italic = true
      break
  }

  return ret
}

/**
 * Convert time stamp to string.
 * @param {Number} timestamp
 *
 * This function fixes time stamp error for old Tilitin database, which has period 22:00PM Finnish time as period start/end.
 */
function time2str(timestamp) {
  return moment(timestamp).utc().add(2, 'hours').format('YYYY-MM-DD')
}

/**
 * Construct column title for period.
 * @param {String} formatName
 * @param {Object} period
 * @param {Object} settings
 */
function columnTitle(formatName, period, settings) {
  const start = time2str(period.start_date)
  let end
  if (settings.query.quarter1) {
    const year = moment(period.start_date + 3 * 60 * 60 * 1000).utc().year()
    end = moment({ year, month: 3, date: 1 }).subtract(1, 'day').format('YYYY-MM-DD')
  } else if (settings.query.quarter2) {
    const year = moment(period.start_date + 3 * 60 * 60 * 1000).utc().year()
    end = moment({ year, month: 6, date: 1 }).subtract(1, 'day').format('YYYY-MM-DD')
  } else if (settings.query.quarter3) {
    const year = moment(period.start_date + 3 * 60 * 60 * 1000).utc().year()
    end = moment({ year, month: 9, date: 1 }).subtract(1, 'day').format('YYYY-MM-DD')
  } else {
    end = time2str(period.end_date)
  }
  switch (formatName) {
    case 'balance-sheet':
    case 'balance-sheet-detailed':
      return '{' + end + '}'
    default:
      return '{' + start + '} - {' + end + '}'
  }
}

/**
 * Report generator for general journal.
 */
processEntries.GeneralJournal = (entries, periods, formatName, format, settings) => {

  const columns = [{
    type: 'id',
    name: 'id',
    title: '{column-document-number}'
  }, {
    type: 'name',
    name: 'title',
    title: '{column-date-and-accounts}'
  }, {
    type: 'numeric',
    name: 'debit',
    title: '{column-debit}'
  }, {
    type: 'numeric',
    name: 'credit',
    title: '{column-credit}'
  }]

  // Pre-process entries by their document number.
  const docs = new Map()
  entries.forEach((entry) => {
    let data
    if (docs.has(entry.documentId)) {
      data = docs.get(entry.documentId)
    } else {
      data = []
    }
    data.push({
      name: entry.name,
      number: entry.number,
      description: entry.description,
      date: entry.date,
      amounts: {
        debit: entry.amount >= 0 ? entry.amount : null,
        credit: entry.amount < 0 ? -entry.amount : null
      }
    })

    docs.set(entry.documentId, data)
  })

  // Helper to construct a list of descriptions.
  const descriptions = (lines) => {
    let texts = new Set()
    const accountNumbers = new Map()

    lines.forEach((line) => {
      const text = line.description.replace(/^(\[.+?\])+\s*/, '')
      if (text !== '') {
        texts.add(text)
        if (!accountNumbers.has(text)) {
          accountNumbers.set(text, new Set())
        }
        accountNumbers.get(text).add(line.number)
      }
    })

    texts = [...texts]
    if (texts.length === 1) {
      return texts
    }

    return texts.map((text) => text + ' [' + [...accountNumbers.get(text)].join(', ') + ']')
  }

  // Construct lines for each document.
  const docIds = [...docs.keys()].sort((a, b) => parseInt(a) - parseInt(b))
  const data = []
  docIds.forEach((docId) => {
    const lines = docs.get(docId)
    data.push({
      tab: 0,
      bold: true,
      id: `#${docId}`,
      needLocalization: true,
      name: `{${time2str(lines[0].date)}}`
    })
    if (!settings.query.compact) {
      descriptions(lines).forEach((text) => {
        data.push({
          tab: 2,
          name: text,
          fullWidth: 1,
          italic: true
        })
      })
    }
    lines.forEach((line) => {
      if (settings.query.compact) {
        data.push({
          tab: 0,
          name: `${line.number} ${line.name}: ${line.description}`,
          amounts: line.amounts
        })
      } else {
        data.push({
          tab: 2,
          name: `${line.number} ${line.name}`,
          amounts: line.amounts
        })
      }
    })
  })

  return { columns, data }
}

/**
 * Report generator for general ledger.
 */
processEntries.GeneralLedger = (entries, periods, formatName, format, settings) => {

  const columns = [{
    type: 'id',
    name: 'account',
    title: '{column-account-number}'
  }, {
    type: 'name',
    name: 'name',
    title: '{column-name-or-date}'
  }, {
    type: 'numeric',
    name: 'debit',
    title: '{column-debit}'
  }, {
    type: 'numeric',
    name: 'credit',
    title: '{column-credit}'
  }, {
    type: 'numeric',
    name: 'balance',
    title: '{column-balance}'
  }]

  // Pre-process entries by their account number.
  const accounts = new Map()
  const accountNames = new Map()
  entries.forEach((entry) => {
    let data
    if (accounts.has(entry.number)) {
      data = accounts.get(entry.number)
    } else {
      data = []
    }
    data.push({
      name: entry.name,
      number: entry.number,
      documentId: entry.documentId,
      description: entry.description,
      date: entry.date,
      amounts: {
        debit: entry.amount >= 0 ? entry.amount : null,
        credit: entry.amount < 0 ? -entry.amount : null,
        balance: null
      }
    })

    accounts.set(entry.number, data)
    accountNames.set(entry.number, entry.name)
  })

  const accountNumbers = [...accounts.keys()].sort()
  const data = []
  accountNumbers.forEach((number) => {
    const lines = accounts.get(number)
    data.push({
      tab: 0,
      bold: true,
      id: number,
      name: accountNames.get(number)
    })
    let total = 0
    lines.forEach((line) => {
      total += line.amounts.debit
      total -= line.amounts.credit
      line.amounts.balance = total
      if (settings.query.compact) {
        data.push({
          tab: 0,
          needLocalization: true,
          id: `#${line.documentId}`,
          name: `{${time2str(line.date)}} ${line.description.replace(/^(\[.+?\])+\s*/g, '')}`,
          amounts: line.amounts
        })
      } else {
        data.push({
          tab: 0,
          needLocalization: true,
          id: `#${line.documentId}`,
          name: `{${time2str(line.date)}}`
        })
        data.push({
          tab: 0,
          useRemainingColumns: 1,
          italic: true,
          name: `${line.description.replace(/^(\[.+?\])+\s*/g, '')}`
        })
        data.push({
          tab: 0,
          name: '',
          amounts: line.amounts
        })
      }
    })
    data.push({
      tab: 0,
      name: '',
      bold: true,
      bigger: true,
      amounts: {
        debit: '',
        credit: '',
        balance: total
      }
    })
  })

  return { columns, data }
}

/**
 * Parse report format and construct a report from the pre-calculated totals and accounts.
 * @param {String[]} accountNumbers
 * @param {String[]} accountNames
 * @param {String[]} columnNames
 * @param {String} format
 * @param {Object} totals
 */
function parseAndCombineReport(accountNumbers, accountNames, columnNames, format, totals) {

  // Parse report and construct format.
  const allAccounts = [...accountNumbers].sort()
  const ret = []
  format.split('\n').forEach((line) => {
    line = line.trim()
    if (line === '') {
      return
    }
    if (line === '--') {
      ret.push({ pageBreak: true })
      return
    }

    // Split the line and reset variables.
    const [code, ...parts] = line.split(';')
    const name = parts.pop()
    const amounts = {}
    columnNames.forEach((column) => (amounts[column] = null))
    let unused = true
    const item = code2item(code)

    // Collect all totals inside any of the account number ranges.
    for (let i = 0; i < parts.length; i += 2) {
      const from = parts[i]
      const to = parts[i + 1]
      columnNames.forEach((column) => {
        allAccounts.forEach((number) => {
          if (number >= from && number < to) {
            unused = false
            if (totals[column][number] !== undefined) {
              amounts[column] += totals[column][number]
            }
          }
        })
      })
    }

    // If we actually show details we can skip this entry and fill details below.
    if (!item.accountDetails) {
      if (item.required || !unused) {
        item.name = name
        item.amounts = amounts
        ret.push(item)
      }
    }

    // Fill in account details for the entries wanting it.
    if (item.accountDetails) {
      for (let i = 0; i < parts.length; i += 2) {
        const from = parts[i]
        const to = parts[i + 1]
        allAccounts.forEach((number) => {
          if (number >= from && number < to) {
            const item = code2item(code)
            item.isAccount = true
            delete item.accountDetails
            item.name = accountNames[number]
            item.number = number
            item.amounts = {}
            columnNames.forEach((column) => {
              if (totals[column][number] === undefined) {
                item.amounts[column] = null
              } else {
                item.amounts[column] = totals[column][number] + 0
              }
            })
            ret.push(item)
          }
        })
      }
    }
  })

  return ret
}

/**
 * General purpose processor returning data split between tags.
 */
processEntries.DefaultByTags = (entries, periods, formatName, format, settings) => {

  // Construct columns for each tag and extra column for non-tagged.
  const columns = settings.tags.map((tag) => ({
    type: 'numeric',
    name: `tag-${tag.tag}`,
    title: tag.name
  }))
  columns.push({
    type: 'numeric',
    name: 'other',
    title: '{Other}'
  })
  const columnNames = columns.map((col) => col.name)
  const tagSet = new Set(settings.tags.map(t => t.tag))
  columns.unshift({
    name: 'title',
    title: '',
    type: 'name'
  })

  // Summarize all totals from the entries.
  const totals = {}
  columnNames.forEach((column) => (totals[column] = new Map()))
  const accountNames = new Map()
  const accountNumbers = new Set()
  const regex = /^((\[\w+\])+)/
  entries.forEach((entry) => {
    let shares = []
    const r = regex.exec(entry.description)
    if (r) {
      shares = r[1].substr(1, r[1].length - 2).split('][').filter(t => tagSet.has(t))
    }
    let amount = entry.amount
    if (shares.length) {
      // Share the amount so that rounding errors are split.
      const piece = amount < 0 ? Math.ceil(amount / shares.length) : Math.floor(amount / shares.length)
      shares.forEach((tag) => {
        const column = `tag-${tag}`
        totals[column][entry.number] = totals[column][entry.number] || 0
        totals[column][entry.number] += piece
        amount -= piece
      })
      if (amount) {
        // Make semi-random starting point and distribute cents.
        let i = (entry.periodId) % shares.length
        const delta = amount < 0 ? -1 : 1
        for (let count = Math.abs(amount); count > 0; count--) {
          const column = `tag-${shares[i]}`
          totals[column][entry.number] += delta
          amount -= delta
          i = (i + 1) % shares.length
        }
      }
    }

    if (amount) {
      totals.other[entry.number] = totals.other[entry.number] || 0
      totals.other[entry.number] += amount
    }

    accountNames[entry.number] = entry.name
    accountNumbers.add(entry.number)
  })

  const data = parseAndCombineReport(accountNumbers, accountNames, columnNames, format, totals)

  // Find empty columns.
  const found = new Set()
  for (const line of data) {
    for (const [k, v] of Object.entries(line.amounts)) {
      if (v !== null && !isNaN(v)) {
        found.add(k)
      }
    }
  }

  // Remove empty columns.
  for (let i = 0; i < columns.length; i++) {
    if (columns[i].type === 'numeric' && !found.has(columns[i].name)) {
      columns.splice(i, 1)
      i--
    }
  }

  return { columns, data }
}

processEntries.Account = (entries, periods, formatName, format, settings) => {
  const columns = [{
    type: 'id',
    name: 'id',
    title: '{column-document-number}'
  }, {
    type: 'text',
    name: 'date',
    title: '{column-date}'
  }, {
    type: 'text',
    name: 'description',
    title: '{column-description}'
  }, {
    type: 'numeric',
    name: 'debit',
    title: '{column-debit}'
  }, {
    type: 'numeric',
    name: 'credit',
    title: '{column-credit}'
  }, {
    type: 'numeric',
    name: 'balance',
    title: '{column-balance}'
  }]

  const data = []
  let total = 0
  entries.forEach((entry) => {
    total += entry.amount
    data.push({
      id: entry.documentId,
      description: entry.description,
      date: moment(entry.date).format('YYYY-MM-DD'),
      amounts: {
        debit: entry.amount >= 0 ? entry.amount : null,
        credit: entry.amount < 0 ? -entry.amount : null,
        balance: total
      }
    })
  })

  return { columns, data }
}

/**
 * General purpose processor.
 */
processEntries.Default = (entries, periods, formatName, format, settings) => {
  if (settings.query.byTags) {
    return processEntries.DefaultByTags(entries, periods, formatName, format, settings)
  }

  // Construct meta data for columns.
  const columns = periods.map((period) => {
    return {
      type: 'numeric',
      name: 'period' + period.id,
      title: columnTitle(formatName, period, settings)
    }
  }).reverse()
  const columnNames = columns.map((col) => col.name)
  columns.unshift({
    name: 'title',
    title: '',
    type: 'name'
  })

  // Summarize all totals from the entries.
  const totals = {}
  columnNames.forEach((column) => (totals[column] = new Map()))
  const accountNames = new Map()
  const accountNumbers = new Set()
  entries.forEach((entry) => {
    const column = 'period' + entry.periodId
    totals[column][entry.number] = totals[column][entry.number] || 0
    totals[column][entry.number] += entry.amount
    accountNames[entry.number] = entry.name
    accountNumbers.add(entry.number)
  })

  return { columns, data: parseAndCombineReport(accountNumbers, accountNames, columnNames, format, totals) }
}

/**
 * Process data entries in to the report format described as in Tilitin reports.
 * @param {Object[]} entries
 * @param {Object[]} periods
 * @param {String} formatName
 * @param {String} format
 * @param {Object} settings
 */
function processEntries(entries, periods, formatName, format, settings) {

  if (!format && format !== null) {
    return []
  }

  // Apply query filtering.
  let filter = () => true
  if (settings.query.quarter1) {
    filter = (entry) => moment(entry.date + 3 * 60 * 60 * 1000).utc().quarter() <= 1
  } if (settings.query.quarter2) {
    filter = (entry) => moment(entry.date + 3 * 60 * 60 * 1000).utc().quarter() <= 2
  } if (settings.query.quarter3) {
    filter = (entry) => moment(entry.date + 3 * 60 * 60 * 1000).utc().quarter() <= 3
  }
  entries = entries.filter(filter)

  // Select data conversion function and run it.
  const camelCaseName = camelCase(formatName)
  let results
  if (processEntries[camelCaseName]) {
    results = processEntries[camelCaseName](entries, periods, formatName, format, settings)
  } else {
    results = processEntries.Default(entries, periods, formatName, format, settings)
  }

  // Construct the report.
  return {
    format: formatName,
    columns: results.columns,
    meta: {
      businessName: settings.name,
      businessId: settings.business_id
    },
    data: results.data
  }
}

/**
 * Post process results before returning.
 * @param {Array<Object>} data
 * @returns {Array<Object>}
 */
function postProcess(data) {
  const camelCaseName = camelCase(data.format)
  if (postProcess[camelCaseName]) {
    return postProcess[camelCaseName](data)
  }
  return data
}

postProcess.BalanceSheet = function(data) {
  const liabilities = data.data.find(line => line.name === 'Vastattavaa yhteensä')
  const assets = data.data.find(line => line.name === 'Vastaavaa yhteensä')
  if (liabilities && assets) {
    Object.values(liabilities.amounts).forEach((value, idx) => {
      if (Object.values(assets.amounts)[idx] !== value) {
        assets.error = true
        liabilities.error = true
      }
    })
  }

  return data
}

postProcess.BalanceSheetDetailed = function(data) {
  return postProcess.BalanceSheet(data)
}

/**
 * Construct a report data structure for the given Tilitin format.
 * @param {String} db
 * @param {Number[]} periodIds
 * @param {String} formatName
 * @param {String} format
 * @param {Object} [query]
 *
 * Resulting entries is an array of objects containing:
 * * `tab` Zero originating indentation number.
 * * `error` If true, this row has an error.
 * * `required` If true, this is always shown.
 * * `hideTotal` if true, do not show total.
 * * `bold` if true, show in bold.
 * * `italic` if true, show in italic.
 * * `bigger` if true, show in bigger font.
 * * `fullWidth` if set, the content in column index defined here is expanded to cover all columns.
 * * `useRemainingColumns` if set, extend this column index to use all the rest columns in the row.
 * * `accountDetails` if true, after this are summarized accounts under this entry.
 * * `isAccount` if true, this is an account entry.
 * * `needLocalization` if set, value should be localized, i.e. translated via Localization component in ui.
 * * `name` Title of the entry.
 * * `number` Account number if the entry is an account.
 * * `amounts` An object with entry `all` for full total and [Tags] indexing the tag specific totals.
 */
async function create(db, periodIds, formatName, format, query = {}) {

  const negateSomeEntries = (formatName !== 'general-journal' && formatName !== 'general-ledger')
  const negateSql = '(1 - (entry.debit == 0) * 2)' + (negateSomeEntries ? ' * (1 - ((account.type IN (1, 2, 3, 4, 5)) * 2))' : '')

  const reportSettings = await knex.db(db).select('*').from('settings').first()
  reportSettings.query = query

  if (query.byTags) {
    const tagTypes = await settings.get(db, 'income-statement-tag-types', [])
    reportSettings.tags = await tags.getByTypes(knex.db(db), tagTypes)
  }

  const periods = await knex.db(db).select('*').from('period').whereIn('period.id', periodIds)

  let knexQuery = knex.db(db).select(
    knex.db(db).raw('document.period_id AS periodId'),
    'document.number AS documentId',
    'document.date',
    'account.name',
    'account.type',
    'account.number',
    knex.db(db).raw(`ROUND(${negateSql} * entry.amount * 100) AS amount`),
    'entry.description'
  )
    .from('entry')
    .leftJoin('account', 'account.id', 'entry.account_id')
    .leftJoin('document', 'document.id', 'entry.document_id')
    .whereIn('document.period_id', periodIds)

  if (query.accountId) {
    knexQuery = knexQuery.andWhere('account.id', '=', query.accountId)
  }

  knexQuery = (knexQuery
    .orderBy('document.date')
    .orderBy('document.id')
    .orderBy('entry.row_number'))

  const entries = await knexQuery
  const data = processEntries(entries, periods, formatName, format, reportSettings)
  return postProcess(data)
}

/**
 * Get the list of custom report formats.
 */
function customReports() {
  return [{
    id: 'general-journal',
    data: null,
    options: {
      compact: 'boolean:true'
    }
  }, {
    id: 'general-ledger',
    data: null,
    options: {
      compact: 'boolean:true'
    }
  }]
}

/**
 * Get the list of standard report format options.
 */
function standardOptions() {
  return [{
    id: 'income-statement',
    options: {
      quarter1: 'radio:1',
      quarter2: 'radio:1',
      quarter3: 'radio:1',
      full: 'radio:1:default',
      byTags: 'boolean'
    }
  }, {
    id: 'income-statement-detailed',
    options: {
      quarter1: 'radio:1',
      quarter2: 'radio:1',
      quarter3: 'radio:1',
      full: 'radio:1:default',
      byTags: 'boolean'
    }
  }, {
    id: 'balance-sheet',
    options: {
      quarter1: 'radio:1',
      quarter2: 'radio:1',
      quarter3: 'radio:1',
      full: 'radio:1:default'
    }
  }, {
    id: 'balance-sheet-detailed',
    options: {
      quarter1: 'radio:1',
      quarter2: 'radio:1',
      quarter3: 'radio:1',
      full: 'radio:1:default'
    }
  }]
}

module.exports = {
  create,
  customReports,
  standardOptions
}
