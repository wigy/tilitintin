const json2csv = require('json2csv').parse;

/**
 * No conversion.
 * @param {Object} report
 */
function identical(report) {
  return report;
}

/**
 * Convert report to CSV format.
 * @param {Object} report
 */
function csv(report) {
  let csv = [];
  const render = {
    id: (column, entry) => entry.id,
    name: (column, entry) => `${entry.isAccount ? entry.number + ' ' : ''}${entry.name}`,
    numeric: (column, entry) => (entry.amounts &&
      !entry.hideTotal &&
      entry.amounts[column.name] !== '' &&
      entry.amounts[column.name] !== null &&
      !isNaN(entry.amounts[column.name]) &&
      entry.amounts[column.name] !== undefined)
      ? (entry.amounts[column.name] / 100) : ''
  };

  const { data, columns } = report;
  data.forEach((entry) => {
    let line = {};
    columns.forEach((column) => {
      line[column.name] = render[column.type](column, entry);
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
