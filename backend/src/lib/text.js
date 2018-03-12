const { num } = require('libfyffe').util;

/**
 * A class able to parse descriptions from the transactions.
 */
class Description {

  constructor() {
    // A list of tags in the entry.
    this.tags = [];
    // A text that has replaced notes with `()`, change amount with `+$`, target with `###`,
    // total owned with `+#` and average price with `+$/###`.
    this.text = null;
    // Notes extracted as text.
    this.notes = [];
    // Either 'sell' or 'buy'.
    this.type = null;
    // Code of the trade target.
    this.target = null;
    // Amount of the target traded.
    this.amount = null;
    // Cumulative total of the target.
    this.total = null;
    // Average price after buying or before selling.
    this.avg = null;
  }

  /**
   * Convert back to the description string.
   */
  toString() {
    const tags = this.tags.map((tag) => '[' + tag + ']');
    let notes = this.notes.map((note) =>
      note.replace('+#', num.trim(this.total)).replace('+$/###', num.currency(this.avg))
    );
    let text = this.text.replace('()', '(' + notes.join(', ') + ')');
    if (this.amount !== null) {
      text = text.replace('+$ ###', num.trimSigned(this.amount, this.target));
    }
    return (tags.length ? tags.join('') + ' ' : '') + text;
  }

  /**
   * Update average price.
   */
  setAvg(avg) {
    if (this.avg === null) {
      if (this.type === 'sell') {
        this.notes = ['k.h. +$/### €/' + this.target].concat(this.notes);
      } else {
        this.notes.push('k.h. nyt +$/### €/' + this.target);
      }
    }
    this.avg = avg;
  }

  /**
   * Extract parts of the description text to the `Description` instance.
   * @param {String} text
   * @return {Description}
   */
  static parse(text0) {
    let text = text0;
    let ret = new Description();

    // Extract tags.
    do {
      let match = /^\[([a-zA-Z0-9]+)\]\s*(.*)/.exec(text);
      if (!match) {
        break;
      }
      ret.tags.push(match[1]);
      text = match[2];
    } while(true);

    // Extract notes.
    let sub = /(.*)\((.*)\)(.*)/.exec(text);
    if (sub) {
      text = sub[1] + '()' + sub[3];
      ret.notes = sub[2].split(', ');
    }

    // Extract numbers and target.
    const match = /^(Myynti|Osto) ([-+][0-9.]+) ([A-Z0-9]+)\b(.*)/.exec(text);
    if (!match) {
      throw new Error('Unable to analyze ' + JSON.stringify(text0));
    }
    ret.type = match[1] === 'Myynti' ? 'sell' : 'buy';
    ret.target = match[3];
    ret.amount = parseFloat(match[2]);
    text = match[1] + ' +$ ###' + match[4];
    ret.text = text;

    // Analyse notes.
    ret.notes.forEach((note, idx) => {
      let match = /^(yht\.|jälj\.) ([-0-9.]+)(.*)$/.exec(note);
      if (match) {
        ret.total = parseFloat(match[2]);
        ret.notes[idx] = match[1] + ' +#' + match[3];
      } else {
        match = /^(k\.h\.)( nyt)? ([0-9.,]+) (€\/\w+)$/.exec(note);
        if (match) {
          ret.avg = parseFloat(match[3].replace(/,/g, ''));
          ret.notes[idx] = match[1] + (match[2] || '') + ' +$/### ' + match[4];
        } else {
          throw new Error('Unable to parse note ' + JSON.stringify(note));
        }
      }
    });

    return ret;
  }
}

module.exports = {
  parse: (text) => Description.parse(text)
};
