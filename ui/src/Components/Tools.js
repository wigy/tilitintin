import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import { withTranslation } from 'react-i18next'
import Store from '../Stores/Store'
import Settings from '../Stores/Settings'
import ToolsForVAT from './ToolsForVAT'
import ToolsForPeriods from './ToolsForPeriods'
import ToolsForDocuments from './ToolsForDocuments'
import ToolsForDatabases from './ToolsForDatabases'

@withTranslation('translations')
@inject('store')
@inject('settings')
@observer
class Tools extends Component {

  render() {

    if (!this.props.store.token) {
      return ''
    }
    const { db, periodId, tool } = this.props.match.params

    if (tool === 'vat') {
      return <ToolsForVAT db={db} periodId={periodId}/>
    } else if (tool === 'documents') {
      return <ToolsForDocuments db={db} periodId={periodId}/>
    } else if (tool === 'periods') {
      return <ToolsForPeriods db={db}/>
    } else {
      return <ToolsForDatabases />
    }
  }
}

Tools.propTypes = {
  match: PropTypes.object,
  settings: PropTypes.instanceOf(Settings),
  store: PropTypes.instanceOf(Store)
}
export default Tools
