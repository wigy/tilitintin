import i18n from 'i18next';

i18n.init({
  resources: {
    fi: {
      translations: {
        'Account Balances': 'Tilien saldot',
        'Account scheme': 'Tilikartta',
        'Account': 'Tili',
        'Account Name': 'Tilin nimi',
        'Account Number': 'Tilin numero',
        'Account Type': 'Tilin laji',
        'Accounts': 'Tilit',
        'All documents are correctly numbered.': 'Kaikki tositteet on numeroitu oikein.',
        'Cancel': 'Peru',
        'Confirm': 'Hyväksy',
        'Credit': 'Kredit',
        'Cumulated VAT from purchases': 'Kertynyt ALV ostoista',
        'Cumulated VAT from sales': 'Kertynyt ALV myynnistä',
        'Current VAT payable': 'Nykyiset ALV velat',
        'Current VAT receivable': 'Nykyiset ALV saatavat',
        'Date': 'Päiväys',
        'Debit': 'Debet',
        'Description': 'Kuvaus',
        'Documents': 'Tositteet',
        'Documents that need renumbering': 'Uudelleennumerointia vaativat tositteet',
        'End Date': 'Loppuu',
        'Initial balance': 'Alkusaldo',
        'Invalid credentials.': 'Kirjautuminen epäonnistui.',
        'Locked': 'Lukittu',
        'Login': 'Kirjaudu',
        'Logout': 'Poistu',
        'Mark as a favorite': 'Merkise suosikiksi',
        'No': 'Ei',
        'Other': 'Muu',
        'Password': 'Salasana',
        'Payable to add': 'Lisättävä velkaa',
        'period {{period}}': 'tilikausi {{period}}',
        'Periods': 'Tilikaudet',
        'Receivable to add': 'Lisättävä saatavia',
        'Remove favorite status': 'Poista suosikeista',
        'Reports': 'Raportit',
        'Select database': 'Valitse kanta',
        'Select period': 'Valitse tilikausi',
        'Start Date': 'Alkaa',
        'Start new period?': 'Aloitetaanko uusi tilikausi?',
        'This database does not have configured VAT accounts.': 'Tässä tietokannassa ei ole konfiguroituna ALV-tilejä.',
        'Tools': 'Työkalut',
        'Total': 'Yhteensä',
        'Transactions': 'Tapahtumat',
        'Username': 'Käyttäjätunnus',
        'Value Added Tax': 'Arvonlisävero',
        'VAT from purchases': 'ALV ostoista',
        'VAT from sales': 'ALV myynnistä',
        'VAT update': 'ALV päivitys',
        'Yes': 'Kyllä',

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

        'icon-all-account-types': 'Valitse kaikki tyyppivalinnat',
        'icon-disable-all': 'Piilota kaikki',
        'icon-download-csv': 'Lataa CSV-tiedostona',
        'icon-favorite': 'Suosikit',
        'icon-fix-vat-descriptions': 'Korjaa puuttuvat kuvaukset',
        'icon-none-account-types': 'Poista kaikki tyyppivalinnat',
        'icon-option-byTags': 'Tägeittäin',
        'icon-option-compact': 'Tiivistetympi esitysmuoto',
        'icon-option-full': 'Koko vuosi',
        'icon-option-quarter1': 'Ensimmäinen neljännes',
        'icon-option-quarter2': 'Ensimmäinen puoli vuotta',
        'icon-option-quarter3': 'Kolme neljännestä',
        'icon-print': 'Tulosta',
        'icon-reset': 'Näytä kaikki',
        'icon-summarize-vat-period': 'Kerää ALV velat/saatavat',
        'icon-lock-period': 'Lukitse tilikausi',
        'icon-unlock-period': 'Poista tilikauden lukitus',
        'icon-create-period': 'Aloita uusi tilikausi',
        'icon-sort-documents': 'Järjestä tositenumerot päivämääräjän mukaan',
        'icon-asset': 'Varat',
        'icon-liability': 'Velat',
        'icon-equity': 'Pääoma',
        'icon-revenue': 'Tulot',
        'icon-expense': 'Menot',
        'icon-profit': 'Voitto',

        'column-account-number': 'Nro',
        'column-balance': 'Saldo',
        'column-credit': 'Kredit',
        'column-date-and-accounts': 'Päiväys ja tilit',
        'column-debit': 'Debet',
        'column-document-number': 'Nro',
        'column-name-or-date': 'Tili / Päiväys',

        'ASSET': 'Varat ja saatavat',
        'LIABILITY': 'Velka',
        'EQUITY': 'Pääoma',
        'REVENUE': 'Tulo',
        'EXPENSE': 'Meno',
        'PROFIT_PREV': 'Edellisten tilikausien voitto',
        'PROFIT': 'Voitto'
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
