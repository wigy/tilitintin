import React, { Component } from 'react';
import { translate, Trans } from 'react-i18next';
import './TextEdit.css';

export default class TextEdit extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      error: null
    };
  }

  componentDidMount() {
    this.inputRef.focus();
    this.inputRef.select();
  }

  onKeyPress(key) {
    if (key === 'Enter') {
      const error = this.props.validate && this.props.validate(this.state.value);
      if (error) {
        this.setState({error});
      } else {
        const complete = this.props.onComplete(this.state.value);
        if (complete.then) {
          complete.then(() => {})
            .catch(err => {
              console.error(err);
              this.setState({error: <Trans>Saving failed.</Trans>});
            });
        }
      }
    }
  }

  render() {
    return (
      <div className="TextEdit">
        <div className="error">{this.state.error}</div>
        <input
          value={this.state.value}
          ref={(input) => { this.inputRef = input }}
          onChange={event => this.setState({value: event.target.value, error: null})}
          onKeyPress={event => this.onKeyPress(event.key)}
        />
      </div>);
  }
}
