import React, { Component } from 'react'
import Flag from 'react-world-flags'
import i18n from '../i18n'

class LanguageSelector extends Component {
  onChangeLanguage() {
    if (i18n.language === 'fi') {
      localStorage.setItem('language', 'en')
    } else {
      localStorage.setItem('language', 'fi')
    }
    document.location.reload()
  }

  render() {
    const lang = i18n.language === 'fi' ? 'fin' : 'gbr'
    return <Flag code={lang} height="20" onClick={() => this.onChangeLanguage()} />
  }
}

export default LanguageSelector
