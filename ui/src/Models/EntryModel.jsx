import React from 'react'
import LinkedText from './LinkedText'
import { sprintf } from 'sprintf-js'
import NavigationTargetModel from './NavigationTargetModel'
import TagModel from './TagModel'
import Money from '../Components/Money'
import { str2num } from '../Util'
import i18n from '../i18n'
import { action, makeObservable } from 'mobx'

class EntryModel extends NavigationTargetModel {

  static FLAGS = {
    // If set, this entry is summary for VAT.
    VAT_IGNORE: 1,
    // If set, this entry has been collected for VAT.
    VAT_RECONCILED: 2
  };

  constructor(parent, init = {}) {
    super(parent, {
      id: null,
      // The linked account this entry is affecting.
      account_id: null,
      // Positive amount in cents.
      amount: 0,
      // If set to 1, this is debit, otherwise credit.
      debit: 1,
      // Description text without tags.
      description: '',
      // ID of the document this entry belongs to.
      document_id: null,
      // Combined flags.
      flags: 0,
      // Order number for this entry.
      row_number: null,
      // Tag names extracted from the description.
      tagNames: []
    }, init)
    makeObservable(this)
  }

  /**
   * Combine tags to description.
   */
  toJSON() {
    const ret = super.toJSON()
    if (ret.tagNames.length) {
      ret.description = '[' + ret.tagNames.join('][') + '] ' + ret.description
    }
    delete ret.tagNames
    return ret
  }

  /**
   * Extract tags.
   * @param {Object} data
   */
  initialize(data) {
    const [description, tagNames] = TagModel.desc2tags(data.description || '')
    return { ...data, description, tagNames }
  }

  getSortKey() {
    return this.parent ? [this.parent.date, this.parent.number, this.row_number] : this.id
  }

  columns() {
    return ['account', 'description', 'debit', 'credit']
  }

  getId() {
    return 'Entry' + (this.id || 'New')
  }

  getObjectType() {
    return 'Entry'
  }

  rows() {
    return this.document.entries
  }

  /**
   * Cursor has entered document this entry belongs.
   */
  @action
  enter() {
    this.document.selected = true
  }

  /**
  * Cursor has left this document this entry belongs.
  */
  @action
  leave() {
    this.document.selected = false
  }

  /**
   * Open the parent document.
   */
  @action
  toggleOpen() {
    this.document.open = !this.document.open
    this.open = !this.open
  }

  /**
   * Check if the cell is currently selected.
   * @param {Number} column
   * @param {Number} row
   */
  isSubSelected(column, row) {
    return (
      this.document.selected &&
      row !== null &&
      this.document.entries.indexOf(this) === row &&
      column !== null &&
      this.columns()[column] === this.column
    )
  }

  /**
   * This is editable if period not locked.
   */
  canEdit() {
    return !this.period.locked
  }

  /**
   * Turn editor on, if this is opened.
   * @param {Cursor} cursor
   */
  keyEnter(cursor) {
    if (this.document.open) {
      if (cursor.row === null) {
        this.document.turnEditorOn(cursor)
        return { preventDefault: true }
      } else {
        this.turnEditorOn(cursor)
        return { preventDefault: true }
      }
    } else {
      this.toggleOpen()
      return { preventDefault: true }
    }
  }

  /**
   * Turn editor on, if this is opened.
   * @param {Cursor} cursor
   */
  keyBackspace(cursor) {
    if (this.document.open) {
      this.turnEditorOn(cursor)
      return { preventDefault: true }
    }
  }

  /**
   * Turn the correct entry into edit mode.
   * @param {Cursor} cursor
   */
  @action
  turnEditorOn(cursor) {
    if (cursor.row !== null && cursor.row < this.document.entries.length) {
      const entry = this.document.entries[cursor.row]
      if (entry.canEdit()) {
        entry.edit = true
        cursor.editTarget = entry
      } else {
        this.store.addError(i18n.t('Cannot edit this entry. Period locked?'))
      }
    } else if (cursor.row === null) {
      if (this.document.canEdit()) {
        this.document.edit = true
        cursor.editTarget = this.document
      } else {
        this.store.addError(i18n.t('Cannot edit this entry. Period locked?'))
      }
    }
  }

  /**
  * Turn edit mode off.
  * @param {Cursor} cursor
  */
  @action
  turnEditorOff(cursor) {
    if (cursor.row !== null && cursor.row < this.document.entries.length) {
      const entry = this.document.entries[cursor.row]
      entry.edit = false
      cursor.editTarget = null
    }
  }

  /**
  * Walk through columns and rows and add an entry, if on the last column of the last row.
  * @param {Cursor} cursor
  */
  keyTab(cursor) {
    if (cursor.row === null) {
      cursor.setCell(0, 0)
      // Since we enter on second column when coming from null-row, redo it.
      return cursor.setCell(0, 0)
    } else {
      const model = cursor.getModel()
      const [columns, rows] = model.geometry()
      if (cursor.column < columns - 1) {
        return cursor.setCell(cursor.column + 1, cursor.row)
      } else if (cursor.row < rows - 1) {
        return cursor.setCell(0, cursor.row + 1)
      }
      // On last row and column, pass to the other handler.
    }
  }

  /**
  * Walk through columns and rows in reverse order.
  * @param {Cursor} cursor
  */
  keyShiftTab(cursor) {
    if (cursor.row !== null) {
      const model = cursor.getModel()
      const [columns] = model.geometry()
      if (cursor.column > 0) {
        return cursor.setCell(cursor.column - 1, cursor.row)
      } else if (cursor.row > 0) {
        return cursor.setCell(columns - 1, cursor.row - 1)
      } else {
        return cursor.setCell(null, null)
      }
    }
  }

  /**
  * Turn editor on for entry or document, if this is opened.
  * @param {Cursor} cursor
  */
  keyText(cursor) {
    if (this.document.open) {
      if (cursor.row === null) {
        this.document.turnEditorOn(cursor)
        return { preventDefault: false }
      } else {
        this.turnEditorOn(cursor)
        return { preventDefault: false }
      }
    }
  }

  /**
  * Split a string starting with tags to list of tags and the rest of the string.
  * @param {String} value
  * @return [String[], String|null]
  * If tags are not valid, the reminder part is null.
  */
  extractTags(value) {
    let tags = []
    value = value.trim()
    const regex = /^(\[(\w+?)\])+/.exec(value)
    if (regex) {
      tags = regex[0].substr(1, regex[0].length - 2).split('][')
      for (const tagName of tags) {
        if (!this.database.hasTag(tagName)) {
          return [[], null]
        }
      }
      value = value.substr(regex[0].length).trim()
    }
    return [tags, value]
  }

  /**
  * Description is required field, which includes also tags during the edit.
  * @param {String} value
  */
  ['validate.description'](value) {
    const REQUIRED = 'This field is required.'
    const INVALID_TAG = 'Undefined tag.'

    const [, newValue] = this.extractTags(value)
    if (newValue === null) {
      return INVALID_TAG
    }
    return value ? null : REQUIRED
  }

  ['get.edit.description']() {
    const tags = this.tagNames.length ? '[' + this.tagNames.map(t => t).join('][') + '] ' : ''
    return tags + this.description
  }

  ['get.description']() {
    const tags = this.tagNames.length ? '[' + this.tagNames.map(t => t).join('][') + '] ' : ''
    return tags + this.description
  }

  ['change.description'](value) {
    const [tags, newValue] = this.extractTags(value)
    this.description = newValue
    this.tagNames.replace(tags)
    this.period.refreshTags()
  }

  async ['proposal.description'](value) {
    const entries = await this.store.fetchEntryProposals(this.database.name, this.account_id)
    const texts = [...new Set([...entries.map(e => e.description)])]
    value = value.toLowerCase()
    return texts.filter(t => value === '' || t.toLowerCase().indexOf(value) >= 0).sort()
  }

  /**
  * Helper to calculate debit or credit field value.
  * @param {String} str
  */
  evalFormula(str) {
    const variables = { T: 0, D: 0, K: 0 }
    for (const e of this.document.entries) {
      if (e.debit) {
        variables.D += e.amount
        variables.T += e.amount
      } else {
        variables.K += e.amount
        variables.T -= e.amount
      }
    }
    variables.T = Math.abs(variables.T)
    variables.D /= 100
    variables.K /= 100
    variables.T /= 100
    variables.d = variables.D
    variables.k = variables.K
    variables.t = variables.T
    return str2num(str, variables) * 100
  }

  /**
  * Format as money, if this is debit entry.
  */
  ['get.debit']() {
    return this.debit && this.amount !== '' ? (<Money cents={this.amount} currency="EUR" />) : <span>&nbsp;</span>
  }

  ['get.edit.debit']() {
    return this.debit ? sprintf('%.2f', this.amount / 100) : ''
  }

  ['validate.debit'](value) {
    const INVALID_NUMBER = 'Numeric value incorrect.'
    const NO_NEGATIVE = 'Cannot be negative.'

    if (value === '') {
      return null
    }
    const num = this.evalFormula(value)
    if (isNaN(num)) {
      return INVALID_NUMBER
    }
    if (num < 0) {
      return NO_NEGATIVE
    }
    return null
  }

  ['change.debit'](value) {
    if (value !== '') {
      this.debit = 1
      this.amount = Math.round(this.evalFormula(value))
    }
  }

  ['proposal.debit'](value) {
    const amounts = new Set()
    const imbalance = []
    // Add always imbalance as proposal.
    const miss = this.document.imbalance() + (this.debit ? -this.amount : this.amount)
    if (miss < 0) {
      imbalance.push(sprintf('%.2f', -miss / 100))
    }
    // Add old values that match.
    value = value.trim()
    this.store.transactions.forEach((tx) => {
      for (let i = 0; i < tx.document.entries.length; i++) {
        if (tx.document.entries[i].account_id === this.account_id && tx.document.entries[i].debit) {
          if (value !== '') {
            const [base, decimals] = sprintf('%.2f', tx.document.entries[i].amount / 100).split('.')
            const [valueBase, valueDecimals] = value.split(/[^0-9]/)
            if (!base.startsWith(valueBase)) {
              continue
            }
            if (valueDecimals !== undefined && !decimals.startsWith(valueDecimals)) {
              continue
            }
          }
          amounts.add(tx.document.entries[i].amount)
        }
      }
    })
    // Sort and combine.
    amounts.delete(-miss)
    const others = [...amounts].sort((a, b) => a - b).map((a) => sprintf('%.2f', a / 100))
    return imbalance.concat(others)
  }

  /**
  * Format as money, if this is credit entry.
  */
  ['get.credit']() {
    return !this.debit && this.amount !== '' ? (<Money cents={this.amount} currency="EUR" />) : <span>&nbsp;</span>
  }

  ['get.edit.credit']() {
    return !this.debit ? sprintf('%.2f', this.amount / 100) : ''
  }

  ['validate.credit'](value) {
    return this['validate.debit'](value)
  }

  ['change.credit'](value) {
    if (value !== '') {
      this.debit = 0
      this.amount = Math.round(this.evalFormula(value))
    }
  }

  ['proposal.credit'](value) {
    const amounts = new Set()
    const imbalance = []
    // Add always imbalance as proposal.
    const miss = this.document.imbalance() + (this.debit ? -this.amount : this.amount)
    if (miss > 0) {
      imbalance.push(sprintf('%.2f', miss / 100))
    }
    // Add old values that match.
    value = value.trim()
    this.store.transactions.forEach((tx) => {
      for (let i = 0; i < tx.document.entries.length; i++) {
        if (tx.document.entries[i].account_id === this.account_id && !tx.document.entries[i].debit) {
          if (value !== '') {
            const [base, decimals] = sprintf('%.2f', tx.document.entries[i].amount / 100).split('.')
            const [valueBase, valueDecimals] = value.split(/[^0-9]/)
            if (!base.startsWith(valueBase)) {
              continue
            }
            if (valueDecimals !== undefined && !decimals.startsWith(valueDecimals)) {
              continue
            }
          }
          amounts.add(tx.document.entries[i].amount)
        }
      }
    })
    // Sort and combine.
    amounts.delete(miss)
    const others = [...amounts].sort((a, b) => a - b).map((a) => sprintf('%.2f', a / 100))
    return imbalance.concat(others)
  }

  /**
  * Render link to the transaction listing of the account. For editing, use account number.
  */
  ['get.account']() {
    if (!this.account_id) {
      return ''
    }
    const url = '/' + this.database.name + '/txs/' + this.period.id + '/' + this.account_id + '?entry=' + this.id
    return new LinkedText(url, this.account.toString())
  }

  ['get.edit.account']() {
    return this.account_id ? this.account.number : ''
  }

  ['validate.account'](value) {
    const INVALID_ACCOUNT = 'No such account found.'
    return this.store.accounts.filter(a => a.number === value || a.name === value || `${a.number} ${a.name}` === value).length ? null : INVALID_ACCOUNT
  }

  ['change.account'](value) {
    const account = this.store.accounts.filter(a => a.number === value || a.name === value || `${a.number} ${a.name}` === value)
    this.account_id = account[0].id
  }

  ['proposal.account'](value) {
    const ret = []
    if (value === '') {
      return ret
    }
    this.store.accounts.forEach((a) => {
      if (a.number.startsWith(value) || a.name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        ret.push(`${a.number} ${a.name}`)
      }
    })
    if (ret.length === 0) {
      this.store.accounts.forEach((a) => {
        if (a.name.toLowerCase().indexOf(value.toLowerCase()) > 0) {
          ret.push(`${a.number} ${a.name}`)
        }
      })
    }
    return ret
  }

  /**
  * Turn null account_id to 0 and update period.
  */
  @action
  async save() {
    if (this.account_id === null) {
      this.account_id = 0
    }
    await super.save()
    this.period.addEntry(this)
  }

  /**
  * Get the document this entry belongs to.
  */
  get document() {
    return this.parent
  }

  /**
  * Get the period this entry belongs to.
  */
  get period() {
    return this.parent.period
  }

  /**
  * Get the database this entry belongs to.
  */
  get database() {
    return this.parent.database
  }

  /**
  * Get the description prefixed by the tags.
  */
  get text() {
    return this.tagNames.length ? '[' + this.tagNames.join('][') + '] ' + this.description : this.description
  }

  /**
  * Extract tags from the text and set them and the description.
  * @param {String} text
  */
  @action
  setText(text) {
    this['change.description'](text)
  }

  /**
  * Get the positive (debit) or negative (credit) value of cents.
  */
  get total() {
    return this.debit ? this.amount : -this.amount
  }

  /**
  * Get the account model this entry is for.
  */
  get account() {
    return this.database.getAccount(this.account_id)
  }

  /**
  * Collect tag instances of this entry.
  */
  get tags() {
    return this.tagNames.map((tag) => this.database.getTag(tag)).sort(TagModel.sorter())
  }

  /**
  * Set or clear a flag.
  * @param {String} name
  * @param {Boolean} value
  */
  @action
  setFlag(name, value) {
    if (value) {
      this.flags = this.flags | EntryModel.FLAGS[name]
    } else {
      this.flags = this.flags & ~EntryModel.FLAGS[name]
    }
  }

  /**
  * Get a value of a flag.
  * @param {String} name
  */
  getFlag(name) {
    return !!(this.flags & EntryModel.FLAGS[name])
  }

  get VAT_IGNORE() { return this.getFlag('VAT_IGNORE') }
  set VAT_IGNORE(value) { this.setFlag('VAT_IGNORE', value) }
  get VAT_RECONCILED() { return this.getFlag('VAT_RECONCILED') }
  set VAT_RECONCILED(value) { this.setFlag('VAT_RECONCILED', value) }
}

export default EntryModel
