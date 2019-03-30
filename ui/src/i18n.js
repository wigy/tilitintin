import i18n from 'i18next';

i18n.init({
  resources: {
    fi: {
      translations: {
        'Account Balances': 'Tilien saldot',
        'Account scheme': 'Tilikartta',
        'Accounts': 'Tilit',
        'Cancel': 'Peru',
        'Confirm': 'Hyväksy',
        'Credit': 'Kredit',
        'Date': 'Päiväys',
        'Debit': 'Debet',
        'Description': 'Kuvaus',
        'Login': 'Kirjaudu',
        'Logout': 'Poistu',
        'Other': 'Muu',
        'Password': 'Salasana',
        'Cumulated VAT from sales': 'Kertynyt ALV myynnistä',
        'Cumulated VAT from purchases': 'Kertynyt ALV ostoista',
        'Current VAT receivable': 'Nykyiset ALV saatavat',
        'Current VAT payable': 'Nykyiset ALV velat',
        'Payable to add': 'Lisättävä velkaa',
        'period {{period}}': 'jakso {{period}}',
        'Receivable to add': 'Lisättävä saatavia',
        'Reports': 'Raportit',
        'Select database': 'Valitse kanta',
        'Select period': 'Valitse jakso',
        'Tools': 'Työkalut',
        'Total': 'Yhteensä',
        'Transactions': 'Tapahtumat',
        'Username': 'Käyttäjätunnus',
        'Value Added Tax': 'Arvonlisävero',
        'VAT from purchases': 'ALV ostoista',
        'VAT from sales': 'ALV myynnistä',
        'VAT update': 'ALV päivitys',

        'Cannot be negative.': 'Ei voi olla negatiivinen.',
        'Date is incorrect.': 'Virheellinen päivämäärä.',
        'Debit and credit do not match': 'Debet ja kredit ei täsmää',
        'Delete these transactions?': 'Poistetaanko namä tapahtumat?',
        'Delete this transaction?': 'Poistetaanko tämä tapahtuma?',
        'No such account found.': 'Tiliä ei ole olemassa.',
        'Numeric value incorrect.': 'Virheellinen numeroarvo.',
        'Saving failed.': 'Tallennus epäonnistui.',
        'This field is required.': 'Tämä kenttä ei voi olla tyhjä.',
        'Undefined tag.': 'Tägiä ei ole määritelty.',

        'report-balance-sheet-detailed': 'Tase tilierittelyin',
        'report-balance-sheet': 'Tase',
        'report-general-journal': 'Päiväkirja',
        'report-general-ledger': 'Pääkirja',
        'report-income-statement-detailed': 'Tuloslaskelma tilierittelyin',
        'report-income-statement': 'Tuloslaskelma',

        'icon-disable-all': 'Piilota kaikki',
        'icon-download-csv': 'Lataa CSV-tiedostona',
        'icon-fix-vat-descriptions': 'Korjaa puuttuvat kuvaukset',
        'icon-option-byTags': 'Tägeittäin',
        'icon-option-compact': 'Tiivistetympi esitysmuoto',
        'icon-option-full': 'Koko vuosi',
        'icon-option-quarter1': 'Ensimmäinen neljännes',
        'icon-option-quarter2': 'Ensimmäinen puoli vuotta',
        'icon-option-quarter3': 'Kolme neljännestä',
        'icon-print': 'Tulosta',
        'icon-reset': 'Näytä kaikki',
        'icon-summarize-vat-period': 'Kerää ALV velat/saatavat',

        'column-account-number': 'Nro',
        'column-balance': 'Saldo',
        'column-credit': 'Kredit',
        'column-date-and-accounts': 'Päiväys ja tilit',
        'column-debit': 'Debet',
        'column-document-number': 'Nro',
        'column-name-or-date': 'Tili / Päiväys'
      }
    }
  },

  fallbackLng: 'fi',
  debug: false,

  ns: ['translations'],
  defaultNS: 'translations',

  keySeparator: false,

  interpolation: {
    escapeValue: false,
    formatSeparator: ','
  },

  react: {
    wait: true
  }
});

i18n.changeLanguage('fi');

export default i18n;
