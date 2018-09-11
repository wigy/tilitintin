import React, { Component } from 'react';
import './TextEdit.css';

export default class TextEdit extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    };
  }

  componentDidMount() {
    this.inputRef.focus();
    this.inputRef.select();
  }

  render() {
    return (
      <input className="TextEdit"
        style={{width: '100%'}}
        value={this.state.value}
        ref={(input) => { this.inputRef = input }}
        onChange={event => this.setState({value: event.target.value})}
        onKeyPress={event => {if (event.key === 'Enter') {
          this.props.onComplete(this.state.value);
        }}}
      />);
  }
}
