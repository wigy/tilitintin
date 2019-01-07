const moment = require('moment');
const knex = require('./knex');

/**
 * Construct rendering information object based on the code.
 * @param {String} code
 */
function code2item(code) {
  let ret = {
    column: parseInt(code[2])
  };

  switch (code[0]) {
    case 'D':
      ret.accountDetails = true;
      break;
    case 'H':
      ret.required = true;
      ret.hideTotal = true;
      break;
    case 'G':
      ret.hideTotal = true;
      break;
    case 'S':
      ret.required = true;
      break;
    case 'T':
      break;
  }

  switch (code[1]) {
    case 'B':
      ret.bold = true;
      break;
    case 'I':
      ret.italic = true;
      break;
  }

  return ret;
}

/**
 * Construct column title.
 * @param {String} formatName
 * @param {Object} period
 */
function columnTitle(formatName, period) {
  switch (formatName) {
    case 'balance-sheet':
    case 'balance-sheet-detailed':
      return moment(period.end_date).format('YYYY-MM-DD');
    default:
      return moment(period.start_date).format('YYYY-MM-DD') + ' - ' + moment(period.end_date).format('YYYY-MM-DD');
  }
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

  const DEBUG_PROCESSOR = false;

  if (!format) {
    return [];
  }

  // Construct meta data for columns.
  let columns = periods.map((period) => {
    return {
      name: 'period' + period.id,
      title: columnTitle(formatName, period),
      start: period.start_date,
      end: period.end_date
    };
  }).reverse();
  const columnNames = columns.map((col) => col.name);

  // Summarize all totals from the entries.
  const totals = {};
  columnNames.forEach((column) => (totals[column] = new Map()));
  const accountNames = new Map();
  const accountNumbers = new Set();
  entries.forEach((entry) => {
    const column = 'period' + entry.periodId;
    totals[column][entry.number] = totals[column][entry.number] || 0;
    totals[column][entry.number] += entry.amount;
    accountNames[entry.number] = entry.name;
    accountNumbers.add(entry.number);
    // TODO: Calculate also by tags.
  });

  // Parse report and construct format.
  const allAccounts = [...accountNumbers].sort();
  let ret = [];
  format.split('\n').forEach((line) => {
    line = line.trim();
    if (line === '') {
      return;
    }
    if (line === '--') {
      ret.push({pageBreak: true});
      return;
    }

    // Split the line and reset variables.
    const [code, ...parts] = line.split(';');
    const name = parts.pop();
    let amounts = {};
    columnNames.forEach((column) => (amounts[column] = null));
    let unused = true;
    let hits = [];
    let item = code2item(code);

    // Collect all totals inside any of the account number ranges.
    for (let i = 0; i < parts.length; i += 2) {
      const from = parts[i];
      const to = parts[i + 1];
      columnNames.forEach((column) => {
        allAccounts.forEach((number) => {
          if (number >= from && number < to) {
            unused = false;
            if (totals[column][number] !== undefined) {
              amounts[column] += totals[column][number];
            }
            if (DEBUG_PROCESSOR) {
              hits.push(number + ' ' + column);
            }
          }
        });
      });
    }

    // If debugging, just give out all info.
    if (DEBUG_PROCESSOR) {
      ret.push({item, code, name, amounts, unused, parts, hits});
    } else {
      // If we actually show details we can skip this entry and fill details below.
      if (!item.accountDetails) {
        if (item.required || !unused) {
          item.name = name;
          item.amounts = amounts;
          ret.push(item);
        }
      }
    }

    // Fill in account details for the entries wanting it.
    if (item.accountDetails) {
      for (let i = 0; i < parts.length; i += 2) {
        const from = parts[i];
        const to = parts[i + 1];
        allAccounts.forEach((number) => {
          if (number >= from && number < to) {
            let item = code2item(code);
            item.isAccount = true;
            delete item.accountDetails;
            item.name = accountNames[number];
            item.number = number;
            item.amounts = {};
            columnNames.forEach((column) => {
              item.amounts[column] = totals[column][number] + 0;
            });
            ret.push(item);
          }
        });
      }
    }
  });

  let report = {
    format: formatName,
    columns,
    meta: {
      businessName: settings.name,
      businessId: settings.business_id
    },
    data: ret
  };

  if (DEBUG_PROCESSOR) {
    report.totals = totals;
    report.entries = entries;
  }

  return report;
}

/**
 * Construct a report data structure for the given Tilitin format.
 * @param {String} db
 * @param {Number[]} periodIds
 * @param {String} formatName
 * @param {String} format
 *
 * Resulting entries is an array of objects containing:
 * * `column` Zero originating column number.
 * * `required` If true, this is always shown.
 * * `hideTotal` if true, do not show total.
 * * `bold` if true, show in bold.
 * * `italic` if true, show in italic.
 * * `accountDetails` if true, after this are summarized accounts under this entry.
 * * `isAccount` if true, this is an account entry.
 * * `name` Title of the entry.
 * * `number` Account number if the entry is an account.
 * * `amounts` An object with entry `all` for full total and [Tags] indexing the tag specific totals.
 */
async function create(db, periodIds, formatName, format) {
  return knex.db(db).select('*').from('settings').first()
    .then((settings) => {
      return knex.db(db).select('*').from('period').whereIn('period.id', periodIds)
        .then((periods) => {
          return knex.db(db).select(
            knex.db(db).raw('document.period_id AS periodId'),
            'account.name',
            'account.type',
            'account.number',
            knex.db(db).raw('ROUND((1 - (entry.debit == 0) * 2) * (1 - ((account.type IN (1, 2, 3, 4, 5)) * 2)) * entry.amount * 100) AS amount'),
            'entry.description'
          )
            .from('entry')
            .leftJoin('account', 'account.id', 'entry.account_id')
            .leftJoin('document', 'document.id', 'entry.document_id')
            .whereIn('document.period_id', periodIds)
            .orderBy('account.number')
            .then((entries) => processEntries(entries, periods, formatName, format, settings));
        });
    });
}

module.exports = {
  create
};
