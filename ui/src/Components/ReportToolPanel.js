import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { runInAction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { withTranslation } from 'react-i18next'
import Store from '../Stores/Store'
import IconButton from './IconButton'
import IconSpacer from './IconSpacer'
import Loading from './Loading'
import Configuration from '../Configuration'
import i18n from '../i18n'
import Title from './Title'

const ICONS = {
  'option-compact': 'compact',
  'option-quarter1': 'quarter1',
  'option-quarter2': 'quarter2',
  'option-quarter3': 'quarter3',
  'option-full': 'quarter4',
  'option-byTags': 'tag'
}

@withTranslation('translations')
@inject('store')
@observer
class ReportToolPanel extends Component {

  render() {
    const store = this.props.store
    const lang = i18n.language

    if (!store.token) {
      return ''
    }

    const onPrint = () => {
      window.print()
    }

    const onDownload = () => {
      const url = `${Configuration.API_URL}${store.report.getUrl()}&csv&lang=${lang}`
      fetch(url, {
        method: 'GET',
        headers: new Headers({
          Authorization: 'Bearer ' + store.token
        })
      })
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.target = '_blank'
          a.download = store.report.fileName()
          document.body.appendChild(a)
          a.click()
          a.remove()
        })
    }

    const onToggle = (option) => {
      store.report.config[option] = !store.report.config[option]
      store.fetchReport(store.db, store.periodId, store.report.format)
    }

    const options = store.report ? Object.keys({ ...store.report.options }) : []

    const buttons = [
      <IconButton key="button-print" onClick={onPrint} title="print" icon="print"></IconButton>,
      <IconButton key="button-download" onClick={onDownload} title="download-csv" icon="download"></IconButton>
    ]

    if (options.length) {
      buttons.push(<IconSpacer key="space"/>)
      options.forEach((option) => {
        const [optionType, optionArg1] = store.report.options[option].split(':')
        const name = `option-${option}`
        switch (optionType) {
          case 'boolean':
            buttons.push(<IconButton
              key={name}
              toggle={store.report.config[option]}
              onClick={() => onToggle(option)}
              title={name}
              icon={ICONS[name] || 'unknown'}>
            </IconButton>)
            break
          case 'radio':
            buttons.push(<IconButton
              key={name}
              toggle={store.report.config[option]}
              onClick={() => {
                runInAction(() => {
                  Object.entries(store.report.options).forEach(([opt, type]) => {
                    if (type.startsWith('radio:' + optionArg1)) {
                      store.report.config[opt] = false
                    }
                  })
                  onToggle(option)
                })
              }}
              title={name}
              icon={ICONS[name] || 'unknown'}>
            </IconButton>)
            break
          default:
            throw new Error(`Unsupported report option type ${optionType}`)
        }
      })
    }

    return (
      <div className="ToolPanel">
        {store.report && <Title>{this.props.t('report-' + store.report.format)}</Title>}
        <Loading visible={!store.report} />
        {store.report && buttons}
      </div>
    )
  }
}

ReportToolPanel.propTypes = {
  t: PropTypes.func,
  store: PropTypes.instanceOf(Store)
}

export default ReportToolPanel
