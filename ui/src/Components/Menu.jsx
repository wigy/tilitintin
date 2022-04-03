import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { inject, observer } from 'mobx-react'
import { Trans, withTranslation } from 'react-i18next'
import Store from '../Stores/Store'
import Localize from './Localize'
import Cursor from '../Stores/Cursor'
import LanguageSelector from './LanguageSelector'
import './Menu.css'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import { ButtonGroup } from '@material-ui/core'
import { CalendarToday, NavigateBefore, NavigateNext, Storage } from '@material-ui/icons'
import { action } from 'mobx'
import Configuration from '../Configuration'

@withTranslation('translations')
@inject('store')
@inject('cursor')
@observer
class Menu extends Component {

  menu = [
    {
      title: 'Transactions',
      help: 'View and edit transactions of the current period.',
      shortcut: '2',
      disabled: ({ db, periodId, notLoggedIn }) => !db || !periodId || notLoggedIn,
      action: () => this.handleSelect('txs')
    },
    {
      title: 'Reports',
      help: 'Display various reports for the current period.',
      shortcut: '3',
      disabled: ({ db, periodId, notLoggedIn }) => !db || !periodId || notLoggedIn,
      action: () => this.handleSelect('report')
    },
    {
      title: 'Accounts',
      help: 'View and edit accounting schema of this database.',
      shortcut: '4',
      disabled: ({ db, notLoggedIn }) => !db || notLoggedIn,
      action: () => this.handleSelect('account')
    },
    {
      title: 'Tools',
      help: 'A collection of various tools.',
      shortcut: '5',
      disabled: ({ notLoggedIn, isAdmin }) => notLoggedIn || isAdmin,
      action: () => this.handleSelect('tools')
    },
    {
      title: 'Admin',
      help: 'System administration',
      shortcut: '6',
      disabled: ({ notLoggedIn, isAdmin }) => notLoggedIn || !isAdmin,
      action: () => this.handleSelect('admin')
    },
    {
      title: 'Logout',
      disabled: ({ notLoggedIn }) => notLoggedIn,
      action: () => this.handleSelect('logout')
    }
  ];

  @action
  update({ db, periodId }) {
    if (db === '_') {
      db = null
    }
    periodId = parseInt(periodId) || null
    this.props.store.setPeriod(db, periodId)
  }

  componentDidMount() {
    this.props.cursor.registerMenu(this)
    this.props.store.fetchDatabases()
    this.update(this.props.match.params)
  }

  componentDidUpdate() {
    this.update(this.props.match.params)
  }

  keyCommand1() {
    if (this.props.store.token) {
      this.handleSelect('dashboard')
      return { preventDefault: true }
    }
  }

  keyCommand2() {
    return this.handleShortcut('2')
  }

  keyCommand3() {
    return this.handleShortcut('3')
  }

  keyCommand4() {
    return this.handleShortcut('4')
  }

  keyCommand5() {
    return this.handleShortcut('5')
  }

  keyCommand6() {
    return this.handleShortcut('6')
  }

  keyCommand7() {
    return this.handleShortcut('7')
  }

  keyCommand8() {
    return this.handleShortcut('8')
  }

  keyCommand9() {
    return this.handleShortcut('9')
  }

  handleShortcut(key) {
    key = key.toUpperCase()
    const entry = this.menu.filter(e => e.shortcut === key)
    if (entry.length) {
      if (!this.isEnabled(entry[0])) {
        return
      }
      entry[0].action()
      return { preventDefault: true }
    }
  }

  keyText(cursor, key) {
    key = key.toUpperCase()
    if (key === '<') {
      // TODO: These keys do not necessarily work. It seems to give out | and \ in finnish layout.
      this.handleSelect('previous-period')
      return { preventDefault: true }
    }
    if (key === '>') {
      this.handleSelect('next-period')
      return { preventDefault: true }
    }
  }

  handleSelect(key) {
    const { store, history, cursor } = this.props
    const periods = store.periods
    let url
    const [, db, tool, periodId, accountId, extras] = this.props.history.location.pathname.split('/')
    switch (key) {
      case 'logout':
        store.logout()
        history.push('/')
        break
      case 'admin':
      case 'dashboard':
      case 'txs':
      case 'account':
      case 'report':
      case 'tools':
        url = '/' + (db || '_') + '/' + key
        if (periodId) {
          url += '/' + periodId
        }
        if (accountId) {
          url += '/' + accountId
        }
        cursor.resetSelected()
        history.push(url)
        break
      case 'next-period':
      case 'previous-period':
        if (db && periods && periods.length) {
          let index = periods.findIndex(p => p.id === parseInt(periodId))
          if (index < 0) {
            return
          }
          if (index > 0 && key === 'next-period') {
            index--
          } else if (index < periods.length - 1 && key === 'previous-period') {
            index++
          } else {
            return
          }
          url = '/' + db + '/' + tool + '/' + periods[index].id
          if (accountId) {
            url += '/' + accountId
          }
          if (extras) {
            if (!accountId) {
              url += '/'
            }
            url += '/' + extras
          }
          cursor.resetSelected()
          history.push(url)
        }
        break
      default:
        console.log('No idea how to handle', key)
    }
  }

  isEnabled(entry) {
    const { db, periodId, isAdmin } = this.props.store
    const notLoggedIn = !this.props.store.token
    return !entry.disabled({ db, periodId, isAdmin, notLoggedIn })
  }

  renderMenu(entry) {
    return <Button
      key={entry.title}
      id={`${entry.title}Menu`}
      className="button"
      disabled={!this.isEnabled(entry)}
      color="primary"
      variant="contained"
      onClick={() => entry.action()}
      title={entry.help + (entry.shortcut ? ` (${Configuration.COMMAND_KEY} + ${entry.shortcut})` : '')}
    >
      <Trans>{entry.title}</Trans>
    </Button>
  }

  render() {
    return (
      <div className="Menu">
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" title="Alt + 1" className="icon" color="inherit" aria-label="menu" onClick={() => (document.location = '/')}>
              <img className="logo" alt="logo" src="/logo.png"/>
            </IconButton>
            <span className="database">
              <Storage/> {this.props.store.db || <>&nbsp;&nbsp;&mdash;</>}
            </span>
            <span className="period">
              <CalendarToday/>
              {
                this.props.store.period &&
                <>
                  &nbsp;
                  <Localize date={this.props.store.period.start_date}/>
                  &nbsp;&mdash;&nbsp;
                  <Localize date={this.props.store.period.end_date}/>
                  &nbsp;
                  <ButtonGroup variant="contained" color="primary">
                    <Button onClick={() => this.handleSelect('previous-period')}><NavigateBefore/></Button>
                    <Button onClick={() => this.handleSelect('next-period')}><NavigateNext/></Button>
                  </ButtonGroup>
                </>
              }
              {
                !this.props.store.period &&
                <>
                  &nbsp;&nbsp;&mdash;
                </>
              }
            </span>
            {
              this.menu.map(entry => this.renderMenu(entry))
            }
            <div className="language">
              <LanguageSelector />
            </div>
          </Toolbar>
        </AppBar>
      </div>
    )
  }
}

Menu.propTypes = {
  store: PropTypes.instanceOf(Store),
  cursor: PropTypes.instanceOf(Cursor),
  match: PropTypes.object,
  history: ReactRouterPropTypes.history.isRequired,
  t: PropTypes.any
}

export default Menu
