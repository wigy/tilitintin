import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans, withTranslation } from 'react-i18next';
import Store from '../Stores/Store';
import { inject } from 'mobx-react';
import Panel from './Panel';
import { TextField, Button, FormHelperText } from '@material-ui/core';
import Cursor from '../Stores/Cursor';

@inject('store')
@inject('cursor')
@withTranslation('translations')
class RegisterForm extends Component {

  state = {
    user: '',
    password: ''
  }

  componentDidMount() {
    this.props.cursor.disableHandler();
  }

  componentWillUnmount = () => {
    this.props.cursor.enableHandler();
  }

  onLogin() {
    this.props.onLogin({ user: this.state.user, password: this.state.password });
  }

  render() {

    const { store } = this.props;

    return (
      <Panel title={<Trans>Login to Tilitintin</Trans>}>
        <FormHelperText error>
          {store.messages.map((msg, idx) => <React.Fragment key={idx}>{msg}<br/></React.Fragment>)}
        </FormHelperText>
        <TextField
          style={{ width: '50%' }}
          label={<Trans>Username</Trans>}
          onChange={(event) => (this.setState({ user: event.target.value }))}
        />
        <br/>
        <br/>
        <TextField
          style={{ width: '50%' }}
          label={<Trans>Password</Trans>}
          onChange={(event) => (this.setState({ password: event.target.value }))}
        />
        <br/>
        <br/>
        <Button variant="outlined" onClick={() => this.onLogin()}><Trans>Login</Trans></Button>
      </Panel>
    );
  }
}

RegisterForm.propTypes = {
  store: PropTypes.instanceOf(Store),
  onLogin: PropTypes.func,
  t: PropTypes.func,
  cursor: PropTypes.instanceOf(Cursor)
};

export default RegisterForm;
