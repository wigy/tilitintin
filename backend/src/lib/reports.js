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
 * Process data entries in to the report format described as in Tilitin reports.
 * @param {Object[]} entries
 * @param {String} formatName
 * @param {String} format
 */
function processEntries(entries, formatName, format) {

  const DEBUG_PROCESSOR = false;

  if (!format) {
    return [];
  }

  // Summarize all totals from the entries.
  const totals = {'all': new Map()};
  const accountNames = new Map();
  entries.forEach((entry) => {
    totals.all[entry.number] = totals.all[entry.number] || 0;
    totals.all[entry.number] += entry.amount;
    accountNames[entry.number] = entry.name;
    // TODO: Calculate also by tags.
  });

  // Parse report and construct format.
  const allAccounts = Object.keys(totals['all']);
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
    const [code, ...parts] = line.split(';');
    const name = parts.pop();
    let amounts = {all: 0};
    let unused = true;
    let hits = [];
    let item = code2item(code);

    // Collect all totals inside any of the account number ranges.
    for (let i = 0; i < parts.length; i += 2) {
      const from = parts[i];
      const to = parts[i + 1];
      allAccounts.forEach((number) => {
        if (number >= from && number < to) {
          unused = false;
          amounts.all += totals.all[number];
          if (DEBUG_PROCESSOR) {
            hits.push(number);
          }
        }
      });
    }

    // If debugging, just give out all info.
    if (DEBUG_PROCESSOR) {
      ret.push({item, code, name, amounts, unused, parts, hits});
    } else {
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
            item.amounts = {
              all: totals.all[number]
            };
            ret.push(item);
          }
        });
      }
    }
  });

  return {
    format: formatName,
    data: ret
  };
}

/**
 * Construct a report data structure for the given Tilitin format.
 * @param {String} db
 * @param {Number} period
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
 * * `amounts` An object with entry `all` for full total and [Tags] indexing the tag specific totals.
 */
async function create(db, period, formatName, format) {
  return knex.db(db).select(
    'account.name',
    'account.number',
    knex.db(db).raw('ROUND(((entry.debit == 1) * 2 - 1) * entry.amount * 100) as amount'),
    'entry.description'
  )
    .from('entry')
    .leftJoin('account', 'account.id', 'entry.account_id')
    .leftJoin('document', 'document.id', 'entry.document_id')
    .where({'document.period_id': period})
    .then((entries) => processEntries(entries, formatName, format));
}

module.exports = {
  create
};
