import { Component } from 'react';
import PropTypes from 'prop-types';
import { translate, I18n } from 'react-i18next';

@translate('translations')
class Localize extends Component {

  localize(text) {
    const lang = this.props.i18n.language;

    let match;
    do {
      match = /(\{(\d\d\d\d-\d\d-\d\d)\})/.exec(text);
      if (match) {
        text = text.replace(match[1], new Date(match[2]).toLocaleDateString(lang));
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
  text: PropTypes.string,
  children: PropTypes.any,
  i18n: PropTypes.instanceOf(I18n)
};

export default Localize;
