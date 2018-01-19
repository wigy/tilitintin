const clone = require('clone');

/**
 * A helper for incrementally constructed command lines.
 */
class Cli {

  constructor() {
    // Current list of accepted args.
    this.__args = [];
    // Initial part of usage instructions.
    this.__usage = 'Usage: ' + process.argv[1];
    // Current list of arg descriptions.
    this.__desc = [];
  }

  /**
   * Append a new arg and check if it has been given in commandline already.
   * @param {string} name Name of the arg.
   * @param {array|string} options A list of values or value description.
   * @param {function} options Checker for validity.
   */
  async arg(name, options, check) {

    const arg = '<' + name + '>';
    this.__usage += ' ' + arg;

    let optionList = [];
    let promise = null;

    while (typeof(options) !== 'string') {
      if (options instanceof Array) {
        optionList = clone(options).map((item) => "" + item);
        options = options.length ? options.join(', ') : 'nothing available';
      } else if (options instanceof Function) {
        options = options(this);
      }
      if (options === undefined) {
        console.error('Failed to parse options for', arg);
        process.exit(3);
      }
    }

    options = '     ' + arg + '  is  ' + options;
    this.__desc.push(options);

    let n = this.__args.length + 2;
    if (process.argv.length <= n) {
      console.log();
      console.log(this.__usage);
      console.log();
      console.log(this.__desc.join("\n"));
      console.log();
      process.exit(1);
    }

    const value = process.argv[n];

    if (!check) {
      check = (value) => optionList.includes(value);
    }

    if (!check(value)) {
      console.error('Invalid argument', JSON.stringify(value), 'for', arg + '.');
      process.exit(2);
    }

    this.__args.push(value);
    this[name] = value;
  }
}

module.exports = new Cli();
