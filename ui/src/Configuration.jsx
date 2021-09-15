import pkg from '../package.json'
import { detect } from 'detect-browser'

const browser = detect()

const Configuration = {
  BROWSER: browser.name,
  OS: browser.os,
  VERSION: pkg.version,
  COMMAND_KEY: browser.os === 'iOS' ? '⌘' : 'Alt',
  COMMAND_KEY_MOD: browser.os === 'iOS' ? 'Meta' : 'Alt',
  ICON_KEY: 'Ctrl',
  ICON_KEY_MOD: 'Ctrl',
  // eslint-disable-next-line
  UI_API_URL: UI_API_URL
}

if (!Configuration.UI_API_URL) {
  const siteUrl = new URL(document.location)
  const parts = siteUrl.hostname.split('.')
  parts[0] += '-api'
  Configuration.UI_API_URL = `${siteUrl.protocol}://${parts.join('.')}${siteUrl.port ? ':' + siteUrl.port : ''}`
}

export default Configuration
