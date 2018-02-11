const num = require('./num');

/**
 * A class able to parse descriptions from the transactions.
 */
class Description {

  constructor() {
    // A list of tags in the entry.
    this.tags = [];
    // A text that has replaced notes with `()`, amount with `+$`, target with `###`
    // and total owned with `+#`.
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
    let notes = this.notes.map((note) => note.replace('+#', num.trim(this.total)));
    let text = this.text.replace('()', '(' + notes.join(', ') + ')');
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
      throw new Error('Unable to analyze ' + JSON.stringify(text));
    }
    ret.type = match[1] === 'Myynti' ? 'sell' : 'buy';
    ret.target = match[3];
    ret.amount = parseFloat(match[2]);
    text = match[1] + ' +$ ###' + match[4];
    ret.text = text;

    // Analyse notes.
    ret.notes.forEach((note, idx) => {
      let match = /^(yht\.|jälj\.) ([-+0-9.]+) (\w+)$/.exec(note);
      if (match) {
        ret.total = parseFloat(match[2]);
        ret.notes[idx] = match[1] + ' +# ' + match[3];
      } else {
        throw new Error('Unable to parse ' + JSON.stringify(note));
      }
    });

    return ret;
  }
}

module.exports = {
  parse: (text) => Description.parse(text)
};
