import i18n from 'i18next';

i18n.init({
  resources: {
    fi: {
      translations: {
        'Account Balances': 'Tilien saldot',
        'Account scheme': 'Tilikartta',
        'Accounts': 'Tilit',
        'Cancel': 'Peru',
        'Credit': 'Kredit',
        'Confirm': 'Hyväksy',
        'Date': 'Päiväys',
        'Debit': 'Debet',
        'Description': 'Kuvaus',
        'Login': 'Kirjaudu',
        'Logout': 'Poistu',
        'Password': 'Salasana',
        'period {{period}}': 'jakso {{period}}',
        'Reports': 'Raportit',
        'Select database': 'Valitse kanta',
        'Select period': 'Valitse jakso',
        'Total': 'Yhteensä',
        'Transactions': 'Tapahtumat',
        'Username': 'Käyttäjätunnus',

        'Cannot be negative.': 'Ei voi olla negatiivinen.',
        'Debit and credit do not match': 'Debet ja kredit ei täsmää',
        'Delete this transaction?': 'Poistetaanko tämä tapahtuma?',
        'No such account found.': 'Tiliä ei ole olemassa.',
        'Numeric value incorrect.': 'Virheellinen numeroarvo.',
        'Saving failed.': 'Tallennus epäonnistui.',
        'This field is required.': 'Tämä kenttä ei voi olla tyhjä.',

        'report-general-journal': 'Päiväkirja',
        'report-general-ledger': 'Pääkirja',
        'report-balance-sheet': 'Tase',
        'report-balance-sheet-detailed': 'Tase tilierittelyin',
        'report-income-statement': 'Tuloslaskelma',
        'report-income-statement-detailed': 'Tuloslaskelma tilierittelyin',

        'icon-print': 'Tulosta',
        'icon-reset': 'Näytä kaikki',
        'icon-disable-all': 'Piilota kaikki',

        'column-document-number': 'Nro',
        'column-date-and-accounts': 'Päiväys ja tilit',
        'column-debit': 'Debet',
        'column-credit': 'Kredit'
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
