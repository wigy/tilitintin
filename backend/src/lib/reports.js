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
      return '{' + moment(period.end_date).format('YYYY-MM-DD') + '}';
    default:
      return '{' + moment(period.start_date).format('YYYY-MM-DD') + '} - {' + moment(period.end_date).format('YYYY-MM-DD') + '}';
  }
}

/**
 * Report generator for general journal.
 */
processEntries.GeneralJournal = (entries, periods, formatName, format, settings) => {

  let columns = [{
    type: 'id',
    name: 'id',
    title: 'column-document-number'
  }, {
    type: 'name',
    name: 'title',
    title: 'column-date-and-accounts'
  }, {
    type: 'numeric',
    name: 'debit',
    title: 'column-debit'
  }, {
    type: 'numeric',
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
      name: entry.name,
      number: entry.number,
      description: entry.description,
      date: entry.date,
      amounts: {
        debit: entry.amount >= 0 ? entry.amount : null,
        credit: entry.amount < 0 ? -entry.amount : null
      }
    });

    docs.set(entry.documentId, data);
  });

  // Helper to construct a list of descriptions.
  const descriptions = (lines) => {
    let texts = new Set();
    let accountNumbers = new Map();

    lines.forEach((line) => {
      const text = line.description.replace(/^(\[.+?\])+\s*/, '');
      if (text !== '') {
        texts.add(text);
        if (!accountNumbers.has(text)) {
          accountNumbers.set(text, new Set());
        }
        accountNumbers.get(text).add(line.number);
      }
    });

    texts = [...texts];
    if (texts.length === 1) {
      return texts;
    }

    return texts.map((text) => text + ' [' + [...accountNumbers.get(text)].join(', ') + ']');
  };

  // Construct lines for each document.
  const docIds = [...docs.keys()].sort((a, b) => parseInt(a) - parseInt(b));
  let data = [];
  docIds.forEach((docId) => {
    const lines = docs.get(docId);
    data.push({
      tab: 0,
      bold: true,
      id: `#${docId}`,
      needLocalization: true,
      name: `{${moment(lines[0].date).format('YYYY-MM-DD')}}`
    });
    descriptions(lines).forEach((text) => {
      data.push({
        tab: 2,
        name: text,
        fullWidth: 1,
        italic: true
      });
    });
    lines.forEach((line) => {
      data.push({
        tab: 2,
        name: `${line.number} ${line.name}`,
        amounts: line.amounts
      });
    });
  });

  return { columns, data };
};

/**
 * Report generator for general ledger.
 */
processEntries.GeneralLedger = (entries, periods, formatName, format, settings) => {

  let columns = [{
    type: 'id',
    name: 'account',
    title: 'column-account-number'
  }, {
    type: 'name',
    name: 'name',
    title: 'column-name-or-date'
  }, {
    type: 'numeric',
    name: 'debit',
    title: 'column-debit'
  }, {
    type: 'numeric',
    name: 'credit',
    title: 'column-credit'
  }, {
    type: 'numeric',
    name: 'balance',
    title: 'column-balance'
  }];

  // Pre-process entries by their account number.
  const accounts = new Map();
  const accountNames = new Map();
  entries.forEach((entry) => {
    let data;
    if (accounts.has(entry.number)) {
      data = accounts.get(entry.number);
    } else {
      data = [];
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
    });

    accounts.set(entry.number, data);
    accountNames.set(entry.number, entry.name);
  });

  const accountNumbers = [...accounts.keys()].sort();
  let data = [];
  accountNumbers.forEach((number) => {
    const lines = accounts.get(number);
    data.push({
      tab: 0,
      bold: true,
      id: number,
      name: accountNames.get(number)
    });
    let total = 0;
    lines.forEach((line) => {
      data.push({
        tab: 0,
        italic: true,
        useRemainingColumns: 1,
        name: line.description.replace(/^(\[.+?\])+\s*/g, '')
      });
      total += line.amounts.debit;
      total -= line.amounts.credit;
      line.amounts.balance = total;
      data.push({
        tab: 0,
        needLocalization: true,
        name: `#${line.documentId} {${moment(line.date).format('YYYY-MM-DD')}}`,
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
  columns.unshift({
    name: 'title',
    title: '',
    type: 'name'
  });

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
 * * `fullWidth` if set, the content in column index defined here is expanded to cover all columns.
 * * `useRemainingColumns` if set, extend this column index to use all the rest columns in the row.
 * * `accountDetails` if true, after this are summarized accounts under this entry.
 * * `isAccount` if true, this is an account entry.
 * * `needLocalization` if set, value is localized, i.e. translated via Localization component.
 * * `name` Title of the entry.
 * * `number` Account number if the entry is an account.
 * * `amounts` An object with entry `all` for full total and [Tags] indexing the tag specific totals.
 */
async function create(db, periodIds, formatName, format) {
  const negateSomeEntries = (formatName !== 'general-journal' && formatName !== 'general-ledger');
  const negateSql = '(1 - (entry.debit == 0) * 2)' + (negateSomeEntries ? ' * (1 - ((account.type IN (1, 2, 3, 4, 5)) * 2))' : '');

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
            knex.db(db).raw(`ROUND(${negateSql} * entry.amount * 100) AS amount`),
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
