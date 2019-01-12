const moment = require('moment');
const knex = require('./knex');

/**
 * Construct rendering information object based on the code.
 * @param {String} code
 */
function code2item(code) {
  let ret = {
    tab: parseInt(code[2])
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
 * Report generator for general journal.
 */
processEntries.GeneralJournal = (entries, periods, formatName, format, settings) => {

  let columns = [{
    name: 'debit',
    title: 'column-debit'
  }, {
    name: 'credit',
    title: 'column-credit'
  }];

  // Pre-process entries by their document number.
  const docs = new Map();
  entries.forEach((entry) => {
    let data;
    if (docs.has(entry.documentId)) {
      data = docs.get(entry.documentId);
    } else {
      data = [];
    }
    data.push({
      name: `${entry.number} ${entry.name}`,
      description: entry.description,
      date: entry.date,
      amounts: {
        debit: entry.amount >= 0 ? entry.amount : null,
        credit: entry.amount < 0 ? -entry.amount : null
      }
    });
    docs.set(entry.documentId, data);
  });

  // Construct lines for each document.
  // TODO: Localize dates with special notation.
  // TODO: Full width column support for texts.
  // TODO: Separate texts for each entry, if they differ.
  // TODO: Consider separate column for document number (with fully generalized columns definition)
  // TODO: Column title localization.
  const docIds = [...docs.keys()].sort((a, b) => parseInt(a) - parseInt(b));
  let data = [];
  docIds.forEach((docId) => {
    const lines = docs.get(docId);
    data.push({
      tab: 0,
      bold: true,
      name: `#${docId}\t${moment(lines[0].date).format('YYYY-MM-DD')}`
    });
    data.push({
      tab: 1,
      name: `${lines[0].description}`,
      italic: true
    });
    lines.forEach((line) => {
      data.push({
        tab: 1,
        name: `${line.name}`,
        amounts: line.amounts
      });
    });
  });

  return { columns, data };
};

/**
 * General purpose processor.
 */
processEntries.Default = (entries, periods, formatName, format, settings) => {

  // Construct meta data for columns.
  let columns = periods.map((period) => {
    return {
      type: 'numeric',
      name: 'period' + period.id,
      title: columnTitle(formatName, period)
    };
  }).reverse();
  const columnNames = columns.map((col) => col.name);
  columns.unshift({name: 'title', title: '', type: 'name'});

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
          }
        });
      });
    }

    // If we actually show details we can skip this entry and fill details below.
    if (!item.accountDetails) {
      if (item.required || !unused) {
        item.name = name;
        item.amounts = amounts;
        ret.push(item);
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

  return { columns, data: ret };
};

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
    return [];
  }

  // Select data conversion function and run it.
  const camelCaseName = formatName.split('-').map((s) => s[0].toUpperCase() + s.substr(1)).join('');
  let results;
  if (processEntries[camelCaseName]) {
    results = processEntries[camelCaseName](entries, periods, formatName, format, settings);
  } else {
    results = processEntries.Default(entries, periods, formatName, format, settings);
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
  };
}

/**
 * Construct a report data structure for the given Tilitin format.
 * @param {String} db
 * @param {Number[]} periodIds
 * @param {String} formatName
 * @param {String} format
 *
 * Resulting entries is an array of objects containing:
 * * `tab` Zero originating indentation number.
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
            'document.number AS documentId',
            'document.date',
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
            .orderBy('document.date')
            .orderBy('document.id')
            .orderBy('entry.row_number')
            .then((entries) => processEntries(entries, periods, formatName, format, settings));
        });
    });
}

/**
 * Get the list of custom report formats.
 */
function customReports() {
  return [{
    id: 'general-journal',
    data: null
  }, {
    id: 'general-ledger',
    data: null
  }];
}

module.exports = {
  create,
  customReports
};
