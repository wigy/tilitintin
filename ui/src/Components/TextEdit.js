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
      currentProposal: null,
      error: null
    };
  }

  componentDidMount() {
    this.inputRef.focus();
    this.inputRef.select();
    this.updateProposal(this.state.value);
  }

  onKeyPress(event) {
    if (event.key === 'Enter' || event.key === 'Tab') {
      const value = this.state.currentProposal !== null ? this.state.proposal[this.state.currentProposal] : this.state.value;
      const error = this.props.validate && this.props.validate(value);
      if (error) {
        this.setState({error});
      } else if (this.props.onComplete) {
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
    } else if (event.key === 'ArrowDown') {
      if (this.state.proposal && this.state.proposal.length) {
        let currentProposal;
        if (this.state.currentProposal === null) {
          currentProposal = 0;
        } else {
          currentProposal = this.state.currentProposal + 1;
        }
        if (currentProposal >= this.state.proposal.length) {
          currentProposal = this.state.proposal.length - 1;
        }
        event.preventDefault();
        this.setState({ currentProposal });
        this.scrollToView();
      }
    } else if (event.key === 'ArrowUp') {
      if (this.state.proposal && this.state.proposal.length) {
        let currentProposal = this.state.currentProposal - 1;
        if (currentProposal < 0) {
          currentProposal = null;
        }
        event.preventDefault();
        this.setState({ currentProposal });
        this.scrollToView();
      }
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
    this.updateProposal(value);
  }

  /**
   * Update the proposal according to the value.
   * @param {String} value
   */
  updateProposal(value) {
    if (this.props.proposal) {
      this.props.proposal(value)
        .then((proposal) => {
          let currentProposal = null;
          if (!proposal) {
            proposal = null;
          } else if (typeof proposal === 'string') {
            proposal = [proposal];
          } else {
            currentProposal = this.state.currentProposal;
            if (proposal && proposal.length) {
              if (currentProposal >= proposal.length) {
                currentProposal = proposal.length - 1;
              }
            } else {
              currentProposal = null;
            }
          }
          this.setState({proposal, currentProposal});
          this.scrollToView();
        });
    }
  }

  scrollToView() {
    if (this.state.currentProposal === null) {
      return;
    }
    const el = document.getElementById(`proposal${this.state.currentProposal}`);
    if (el) {
      el.scrollIntoView({block: 'center', inline: 'center'});
    }
  }

  renderProposal() {
    if (this.state.proposal === null || this.state.proposal.length === 0) {
      return '';
    }
    const current = this.state.currentProposal > this.state.proposal.length ? this.state.proposal.length - 1 : this.state.currentProposal;
    return <div className="proposal-container">
      <div className="proposal">
        {this.state.proposal.map(
          (item, index) => <div id={`proposal${index}`} key={index} className={'item' + (current === index ? ' current' : '')}>
            {item}
          </div>
        )}
      </div>
    </div>;
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
        {this.renderProposal()}
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
