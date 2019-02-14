import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import Model from '../Models/Model';
import './TextEdit.css';

@translate('translations')
class TextEdit extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: props.value || '',
      proposal: null,
      error: null
    };
  }

  componentDidMount() {
    this.inputRef.focus();
    this.inputRef.select();
  }

  onKeyPress(event) {
    if (event.key === 'Enter' || event.key === 'Tab') {
      const value = this.state.proposal || this.state.value;
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

  onKeyDown(event) {
    if (event.key === 'Tab') {
      // Has to prevent here or otherwise it is too late and tab also executes normal action.
      event.preventDefault();
      this.onKeyPress(event);
    }
  }

  onKeyUp(event) {
    if (event.key === 'Escape') {
      if (this.props.onCancel) {
        this.props.onCancel();
      }
    }
  }

  onChange(event) {
    const value = event.target.value;
    this.props.onChange && this.props.onChange(value);
    this.setState({value, error: null});
    if (this.props.proposal) {
      this.props.proposal(value)
        .then((proposal) => this.setState({proposal}));
    }
  }

  render() {
    return (
      <div className="TextEdit">
        <div className="error">{this.state.error}</div>
        <input
          value={this.state.value}
          ref={(input) => { this.inputRef = input; }}
          onChange={event => this.onChange(event)}
          onKeyPress={event => this.onKeyPress(event)}
          onKeyUp={event => this.onKeyUp(event)}
          onKeyDown={event => this.onKeyDown(event)}
        />
        <div className="proposal">{this.state.proposal}</div>
      </div>);
  }
}

TextEdit.propTypes = {
  onCancel: PropTypes.func,
  onComplete: PropTypes.func,
  onChange: PropTypes.func,
  validate: PropTypes.func,
  value: PropTypes.string,
  target: PropTypes.instanceOf(Model),
  proposal: PropTypes.func
};

export default TextEdit;
