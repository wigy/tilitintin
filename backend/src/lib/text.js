/**
 * A class able to parse descriptions from the transactions.
 */
class Description {

  constructor() {
    this.tags = [];
    this.text = null;
    this.notes = [];
  }

  toString() {
    const tags = this.tags.map((tag) => '[' + tag + ']');
    return (tags.length ? tags.join('') + ' ' : '') + this.text.replace('()', '(' + this.notes.join(', ') + ')');
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
    ret.text = text;

    return ret;
  }
}

module.exports = {
  parse: (text) => Description.parse(text)
};
