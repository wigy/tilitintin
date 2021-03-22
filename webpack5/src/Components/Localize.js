import { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { date2str } from '../Util';

@withTranslation('translations')
class Localize extends Component {

  localize(text) {
    let match;
    do {
      match = /(\{(\d\d\d\d-\d\d-\d\d)\})/.exec(text);
      if (match) {
        text = text.replace(match[1], date2str(match[2]));
      } else {
        match = /(\{(.*?)\})/.exec(text);
        if (match) {
          text = text.replace(match[1], this.props.t(match[2]));
        }
      }
    } while (match);

    return text;
  }

  render() {
    if ('date' in this.props) {
      return date2str(this.props.date);
    }
    const what = this.props.children;
    if (what === undefined) {
      return '';
    }
    if (typeof what === 'string') {
      return this.localize(what);
    }
    return 'No localization available for ' + typeof what;
  }
}

Localize.propTypes = {
  t: PropTypes.func,
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  children: PropTypes.any
};

export default Localize;
