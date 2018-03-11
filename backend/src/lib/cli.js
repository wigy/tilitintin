const clone = require('clone');

/**
 * A helper for incrementally constructed command lines.
 */
class Cli {

  constructor() {
    // Current list of unparsed args.
    this.__remaining = null;
    // Current list of accepted args.
    this.__args = [];
    // Initial part of usage instructions.
    this.__usage = 'Usage: ' + process.argv[1];
    // Current list of argument or option descriptions.
    this.__desc = [];
    // Currently defined options.
    this.__options = {};
    // Current option values.
    this.options = {};
  }

  /**
   * Define an option for the CLI.
   * @param {String} name
   * @param {any} initial
   * @param {String} desc
   */
  opt(name, initial, desc) {
    this.__options[name] = {default: initial, description: desc};
    this.options[name] = initial;
    this.__desc.push('     --' + name + '\t' + desc);
  }

  /**
   * Extract the options from the command line arguments.
   */
  parseOptions() {
    while (this.__remaining[2] && this.__remaining[2].substr(0, 2) === '--') {
      const opt = this.__remaining[2].substr(2, this.__remaining[2].length);
      const match = /^([-a-z0-9]+)=(.*)/.exec(opt);
      if (this.__options[opt] && !match) {
        this.options[opt] = true;
      } else {
        if (!this.__options[match[1]]) {
          console.error('Invalid option', opt);
          process.exit(4);
        }
        this.options[match[1]] = match[2];
      }
      this.__remaining.splice(2, 1);
    }
  }

  /**
   * Append a new arg and check if it has been given in commandline already.
   * @param {string} name Name of the arg.
   * @param {array|string} values A list of values or value description.
   * @param {function|parseFloat|parseInt} check Checker function for validity.
   */
  arg(name, values, check) {

    if (this.__remaining === null) {
      this.__remaining = clone(process.argv);
      this.parseOptions();
    }

    if (this.__desc.length) {
      this.__desc.push('');
    }

    const arg = '<' + name + '>';
    this.__usage += ' ' + arg;

    let valueList = [];
    let promise = null;

    while (typeof(values) !== 'string') {
      if (values instanceof Array) {
        valueList = clone(values).map((item) => "" + item);
        values = values.length ? '`' + values.join('`, `') + '`' : 'nothing available';
      } else if (values instanceof Function) {
        values = values(this);
      }
      if (values === undefined) {
        console.error('Failed to parse values for', arg);
        process.exit(3);
      }
    }

    values = '     ' + arg + '\t' + values;
    this.__desc.push(values);

    let n = this.__args.length + 2;
    if (this.__remaining.length <= n) {
      if (this.__no_exit) {
        return;
      }
      console.log();
      console.log(this.__usage);
      console.log();
      console.log(this.__desc.join("\n"));
      console.log();
      process.exit(1);
    }

    let value = this.__remaining[n];
    let transform = (x) => x;

    if (!check) {
      if (valueList.length) {
        check = (value) => valueList.includes(value);
      } else {
        check = (value) => true;
      }
    }

    if (check===parseInt) {
      check = (str) => /^-?[0-9]+$/.test(str);
      transform = (str) => parseInt(str);
    } else if (check===parseFloat) {
      check = (str) => /^-?[0-9.]+$/.test(str);
      transform = (str) => parseFloat(str);
    }

    if (!check(value)) {
      console.error('Invalid argument', JSON.stringify(value), 'for', arg + '.');
      process.exit(2);
    }

    value = transform(value);
    this.__args.push(value);
    this[name] = value;
  }

  /**
   * Simimlar to arg() but does not exit when not enough arguments.
   */
  arg_(name, options, check) {
    this.__no_exit = true;
    this.arg(name, options, check);
    delete this.__no_exit;
  }

  /**
   * Catch all, i.e. collect all the remaining arguments.
   */
  args(name, options, check) {
    this.arg(name, options, check);
    this[name] = [this[name]];
    let n = this.__args.length + 2;
    while (n < this.__remaining.length) {
      console.log(n, this.__remaining[n]);
      this[name].push(this.__remaining[n]);
      this.__args.push(this.__remaining[n]);
      n++;
    }
  }
}

module.exports = new Cli();
