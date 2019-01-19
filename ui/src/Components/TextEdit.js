import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import './TextEdit.css';

@translate('translations')
class TextEdit extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      proposal: 19.2,
      error: null
    };
  }

  componentDidMount() {
    this.inputRef.focus();
    this.inputRef.select();
  }

  onKeyPress(key) {
    if (key === 'Enter') {
      const value = this.state.proposal !== null ? this.state.proposal : this.state.value;
      const error = this.props.validate && this.props.validate(value);
      if (error) {
        this.setState({error});
      } else {
        const complete = this.props.onComplete(value);
        if (complete.catch) {
          complete.catch(err => {
            console.error(err);
            this.setState({error: <Trans>Saving failed.</Trans>});
          });
        }
      }
    }
  }

  onKeyUp(key) {
    if (key === 'Escape') {
      if (this.props.onCancel) {
        this.props.onCancel();
      }
    }
  }

  onChange(event) {
    const proposal = event.target.value === ' ' && this.props.proposal ? this.props.proposal + '' : null;
    this.setState({value: event.target.value, proposal, error: null});
  }

  render() {
    return (
      <div className="TextEdit">
        <div className="error">{this.state.error}</div>
        <input
          value={this.state.value}
          ref={(input) => { this.inputRef = input; }}
          onChange={event => this.onChange(event)}
          onKeyPress={event => this.onKeyPress(event.key)}
          onKeyUp={event => this.onKeyUp(event.key)}
        />
        <div className="proposal">{this.state.proposal}</div>
      </div>);
  }
}

TextEdit.propTypes = {
  periodId: PropTypes.any,
  onCancel: PropTypes.func,
  onComplete: PropTypes.func,
  validate: PropTypes.func,
  value: PropTypes.any,
  proposal: PropTypes.string
};

export default TextEdit;
