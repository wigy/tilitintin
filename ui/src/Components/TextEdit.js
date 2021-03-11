import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Model from '../Models/Model';
import { TextField, List, ListItem, Popper, Paper } from '@material-ui/core';
import { inject } from 'mobx-react';
import Cursor from '../Stores/Cursor';
import Store from '../Stores/Store';

@inject('cursor')
@inject('store')
@withTranslation('translations')
class TextEdit extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: props.value || '',
      originalValue: props.value,
      proposal: null,
      currentProposal: null,
      error: false,
      ref: React.createRef()
    };
  }

  componentDidMount() {
    this.updateProposal(this.state.value);
    this.props.cursor.disableHandler();
  }

  componentWillUnmount = () => {
    this.props.cursor.enableHandler();
  }

  onKeyPress(event, index = null) {
    if (event.key === 'Enter' || event.key === 'Tab') {
      if (index === null) {
        index = this.state.currentProposal;
      }
      const proposal = index !== null ? this.state.proposal[index] : null;
      const value = index !== null ? proposal : this.state.value;
      const error = this.props.validate && this.props.validate(value);
      if (error) {
        this.setState({ error: true });
        this.props.store.addError(this.props.t(error));
      } else if (this.props.onComplete) {
        const originalValue = this.state.originalValue;
        const complete = this.props.onComplete(value, proposal, originalValue);
        if (complete.catch) {
          complete.catch(err => {
            console.error(err);
            this.setState({ error: true });
            this.props.store.addError(this.props.t('Saving failed.'));
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
    this.setState({ value, error: false });
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
          this.setState({ proposal, currentProposal });
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
      el.scrollIntoView({ block: 'center', inline: 'center' });
    }
  }

  renderProposal() {
    if (!this.state.ref.current || !this.state.proposal) {
      return '';
    }
    const placement = 'bottom-start';
    const current = this.state.currentProposal > this.state.proposal.length ? this.state.proposal.length - 1 : this.state.currentProposal;
    return (
      <Popper placement={placement} open={!!this.state.proposal && this.state.proposal.length > 0} anchorEl={this.state.ref.current}>
        <Paper style={{ maxHeight: '50vh', overflowY: 'auto' }} elevation={5}>
          <List>
            {this.state.proposal.map(
              (item, index) => (
                <ListItem
                  id={`proposal${index}`}
                  dense
                  style={{ cursor: 'pointer' }}
                  key={index}
                  onClick={ () => {
                    this.onKeyPress({ key: 'Enter' }, index);
                  }}
                  selected={current === index}>
                  {item}
                </ListItem>
              )
            )}
          </List>
        </Paper>
      </Popper>
    );
  }

  render() {
    return (
      <div className="TextEdit" ref={this.state.ref}>
        <TextField
          value={this.state.value}
          error={this.state.error}
          variant="outlined"
          size="small"
          autoFocus
          fullWidth
          onChange={event => this.onChange(event)}
          onKeyPress={event => this.onKeyPress(event)}
          onKeyUp={event => this.onKeyUp(event)}
          onKeyDown={event => this.onKeyDown(event)}
        />
        {this.renderProposal()}
      </div>
    );
  }
}

TextEdit.propTypes = {
  onCancel: PropTypes.func,
  onComplete: PropTypes.func,
  onChange: PropTypes.func,
  validate: PropTypes.func,
  value: PropTypes.string,
  target: PropTypes.instanceOf(Model),
  proposal: PropTypes.func,
  cursor: PropTypes.instanceOf(Cursor),
  store: PropTypes.instanceOf(Store),
  t: PropTypes.func,
};

export default TextEdit;
