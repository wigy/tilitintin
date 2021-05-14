import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject } from 'mobx-react'
import { withTranslation } from 'react-i18next'
import { IconButton } from '@material-ui/core'
import { HelpOutline, AccountBalance, StarRate, AttachMoney, CreditCard, LocalGroceryStore, MoneyRounded, AddShoppingCart, PersonAdd, Print, CloudDownload, FormatIndentDecrease, Filter2, Filter3, Filter1, Filter4, LocalOffer, Lock, LockOpen, AttachFile, Functions, Event, Sort, Delete, Storage, CloudUpload, ZoomIn, ZoomOut, Visibility, VisibilityOff, PlaylistAdd } from '@material-ui/icons'
import Cursor from '../Stores/Cursor'

const ICONS = {
  'add-tx': PlaylistAdd,
  'calendar-plus': Event,
  'credit-card': CreditCard,
  'hide-all': VisibilityOff,
  'shopping-cart': LocalGroceryStore,
  'show-all': Visibility,
  'sort-up': Sort,
  'user-plus': PersonAdd,
  'zoom-in': ZoomIn,
  'zoom-out': ZoomOut,
  compact: FormatIndentDecrease,
  database: Storage,
  download: CloudDownload,
  lock: Lock,
  money: AttachMoney,
  paperclip: AttachFile,
  print: Print,
  profit: MoneyRounded,
  quarter1: Filter1,
  quarter2: Filter2,
  quarter3: Filter3,
  quarter4: Filter4,
  sales: AddShoppingCart,
  savings: AccountBalance,
  star: StarRate,
  summarize: Functions,
  tag: LocalOffer,
  trash: Delete,
  unknown: HelpOutline,
  unlock: LockOpen,
  upload: CloudUpload,
}

@inject('cursor')
@withTranslation('translations')
class TilitintinIconButton extends Component {

  render() {
    const { t, disabled, title, pressKey, onClick, icon, toggle, id } = this.props
    let color = 'primary'
    if (toggle !== undefined) {
      color = toggle ? 'secondary' : undefined
    }
    const Icon = icon in ICONS ? ICONS[icon] : ICONS.unknown
    const handleClick = () => {
      if (!disabled) {
        if (pressKey) {
          this.props.cursor.handle(pressKey)
        }
        if (onClick) {
          onClick()
        }
      }
    }
    return (
      <IconButton id={id} color={color} title={t('icon-' + title)} disabled={disabled} onClick={() => handleClick()}>
        <Icon style={{ fontSize: 30 }}/>
      </IconButton>
    )
  }
}

TilitintinIconButton.propTypes = {
  onClick: PropTypes.func,
  t: PropTypes.func,
  id: PropTypes.string,
  icon: PropTypes.string,
  title: PropTypes.string,
  toggle: PropTypes.bool,
  pressKey: PropTypes.string,
  cursor: PropTypes.instanceOf(Cursor),
  disabled: PropTypes.bool
}

export default TilitintinIconButton
