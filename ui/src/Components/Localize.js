import { Component } from 'react';
import PropTypes from 'prop-types';
import { translate, I18n } from 'react-i18next';

@translate('translations')
class Localize extends Component {

  localize(text) {
    const lang = this.props.i18n.language;
    let match;
    do {
      match = /(\{(\d\d\d\d-\d\d-\d\d)\})/g.exec(text);
      if (match) {
        text = text.replace(match[1], new Date(match[2]).toLocaleDateString(lang));
      }
    } while (match);

    return this.props.t(text);
  }

  render() {
    const what = this.props.children;
    if (what === undefined) {
      return '';
    }
    if (typeof what === 'string') {
      return this.localize(what);
    }
    console.log(what);
    return 'TODO: Localize ' + typeof what;
  }
}

Localize.propTypes = {
  text: PropTypes.string,
  i18n: PropTypes.instanceOf(I18n)
};

export default Localize;
