const num = require('./num');

/**
 * A class able to parse descriptions from the transactions.
 */
class Description {

  constructor() {
    this.tags = [];
    this.text = null;
    this.notes = [];
    this.type = null;
    this.target = null;
    this.amount = null;
  }

  /**
   * Convert back to the description string.
   */
  toString() {
    const tags = this.tags.map((tag) => '[' + tag + ']');
    let text;
    text = this.text.replace('()', '(' + this.notes.join(', ') + ')');
    if (this.amount !== null) {
      text = text.replace('+$ ###', num.trim(this.amount, this.target));
    }
    return (tags.length ? tags.join('') + ' ' : '') + text;
  }

  /**
   * Extract parts of the description text to the `Description` instance.
   * @param {String} text
   * @return {Description}
   */
  static parse(text) {
    let ret = new Description();
    do {
      let match = /^\[([a-zA-Z0-9]+)\]\s*(.*)/.exec(text);
      if (!match) {
        break;
      }
      ret.tags.push(match[1]);
      text = match[2];
    } while(true);

    let sub = /(.*)\((.*)\)(.*)/.exec(text);
    if (sub) {
      text = sub[1] + '()' + sub[3];
      ret.notes = sub[2].split(', ');
    }

    const match = /^(Myynti|Osto) ([-+][0-9.]+) ([A-Z0-9]+)\b(.*)/.exec(text);
    if (!match) {
      throw new Error('Unable to analyze ' + JSON.stringify(text));
    }
    ret.type = match[1] === 'Myynti' ? 'sell' : 'buy';
    ret.target = match[3];
    ret.amount = parseFloat(match[2]);
    text = match[1] + ' +$ ###' + match[4];
    ret.text = text;

    return ret;
  }
}

module.exports = {
  parse: (text) => Description.parse(text)
};
