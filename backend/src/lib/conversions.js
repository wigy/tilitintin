const json2csv = require('json2csv').parse;
const locale = require('./locale');

/**
 * No conversion.
 * @param {Object} report
 * @param {Object} options
 */
function identical(report, options = {}) {
  return report;
}

/**
 * Convert report to CSV format.
 * @param {Object} report
 * @param {Object} options
 * @param {String} options.lang Localize number using this language.
 */
function csv(report, options = {}) {
  const csv = [];

  const render = {
    id: (column, entry) => entry.id,
    name: (column, entry) => `${entry.isAccount ? entry.number + ' ' : ''}${entry.name}`,
    numeric: (column, entry) => (entry.amounts &&
      !entry.hideTotal &&
      entry.amounts[column.name] !== '' &&
      entry.amounts[column.name] !== null &&
      !isNaN(entry.amounts[column.name]) &&
      entry.amounts[column.name] !== undefined)
      ? locale.num(entry.amounts[column.name] / 100, options.lang) : ''
  };

  const { data, columns } = report;
  let line = {};
  columns.forEach((column) => (line[column.name] = column.title));
  csv.push(line);

  data.forEach((entry) => {
    line = {};
    columns.forEach((column) => {
      if (entry.pageBreak) {
        line[column.name] = '';
      } else {
        line[column.name] = render[column.type](column, entry);
      }
    });
    csv.push(line);
  });

  const fields = columns.map((c) => c.name);

  return json2csv(csv, { fields, header: false });
}

module.exports = {
  identical,
  csv
};
