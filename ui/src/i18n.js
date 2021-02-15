import i18n from 'i18next';

i18n.init({
  resources: {
    en: {
      translations: {
        'report-balance-sheet-detailed': 'Detailed balance sheet',
        'report-balance-sheet': 'Balance sheet',
        'report-general-journal': 'General journal',
        'report-general-ledger': 'General ledger',
        'report-income-statement-detailed': 'Detailed income statement',
        'report-income-statement': 'Income statement',

        'icon-all-account-types': 'Choose all types',
        'icon-asset': 'Assets',
        'icon-create-period': 'Create new period',
        'icon-create-user': 'Create new user',
        'icon-disable-all': 'Hide all',
        'icon-drop-empty-documents': 'Remove all empty documents',
        'icon-download-csv': 'Download as CSV',
        'icon-equity': 'Equity',
        'icon-expense': 'Expense',
        'icon-favorite': 'Favourite',
        'icon-fix-vat-descriptions': 'Fix missing descriptions',
        'icon-liability': 'Liabilities',
        'icon-lock-period': 'Lock period',
        'icon-none-account-types': 'Remove all type selections',
        'icon-option-byTags': 'By tags',
        'icon-option-compact': 'Compact presentation',
        'icon-option-full': 'Whole year',
        'icon-option-quarter1': 'First quarter',
        'icon-option-quarter2': 'First half year',
        'icon-option-quarter3': 'First three quarters',
        'icon-print': 'Print',
        'icon-profit': 'Profit',
        'icon-reset': 'Show all',
        'icon-revenue': 'Revenue',
        'icon-sort-documents': 'Re-order document numbers by date',
        'icon-summarize-vat-period': 'Collect VAT payable/receivable',
        'icon-unlock-period': 'Remove period locking',
        'icon-upload-database': 'Upload Tilitin file',
        'icon-new-database': 'Create new database',

        'column-account-number': 'Num',
        'column-balance': 'Balance',
        'column-credit': 'Credit',
        'column-date-and-accounts': 'Date and accounts',
        'column-debit': 'Debit',
        'column-document-number': 'Num',
        'column-name-or-date': 'Account / Date',

        ASSET: 'Assets',
        LIABILITY: 'Liabilities',
        EQUITY: 'Equity',
        REVENUE: 'Revenue',
        EXPENSE: 'Expenses',
        PROFIT_PREV: 'Profit from previous periods',
        PROFIT: 'Profit'
      }
    },
    fi: {
      translations: {
        '{{count}} transactions': '{{count}} tapahtumaa',
        '1 transaction': '1 tapahtuma',
        'Account Balances': 'Tilien saldot',
        'Account name is required.': 'Tilin nimi puuttuu.',
        'Account Name': 'Tilin nimi',
        'Account number exists.': 'Tilin numero on jo käytössä.',
        'Account number is required.': 'Tilin numero puuttuu.',
        'Account Number': 'Tilin numero',
        'Account scheme': 'Tilikartta',
        'Account type is required.': 'Tilin laji puuttuu.',
        'Account Type': 'Tilin laji',
        Account: 'Tili',
        Accounts: 'Tilit',
        'Admin Tools': 'Ylläpitotyökalut',
        'All documents are correctly numbered.': 'Kaikki tositteet on numeroitu oikein.',
        Balance: 'Saldo',
        'Business ID': 'Y-tunnus',
        'Business name': 'Yrityksen nimi',
        Cancel: 'Peru',
        'Cannot be negative.': 'Ei voi olla negatiivinen.',
        'Company Info': 'Yrityksen tiedot',
        'Company Name': 'Yrityksen nimi',
        'Company name is required.': 'Yrityksen nimi puuttuu.',
        'Company Registration Number': 'Y-tunnus',
        Confirm: 'Hyväksy',
        'Create New Account': 'Luo uusi tili',
        'Create New User': 'Luo uusi käyttäjä',
        Credit: 'Kredit',
        'Cumulated VAT by tags': 'Kertynyt ALV tägeittäin',
        'Cumulated VAT from purchases': 'Kertynyt ALV ostoista',
        'Cumulated VAT from sales': 'Kertynyt ALV myynnistä',
        'Current VAT payable': 'Nykyiset ALV velat',
        'Current VAT receivable': 'Nykyiset ALV saatavat',
        Database: 'Tietokanta',
        'Database Name': 'Tietokannan nimi',
        'Database name is required.': 'Tietokannan nimi puuttuu.',
        'Database Management': 'Tietokantojen hallinta',
        'Delayed VAT': 'Siirretty ALV',
        Databases: 'Tietokannat',
        'Date is incorrect.': 'Virheellinen päivämäärä.',
        Date: 'Päiväys',
        'Debit and credit do not match': 'Debet ja kredit ei täsmää',
        Debit: 'Debet',
        'Delete Account': 'Poista tili',
        'Delete these transactions?': 'Poistetaanko namä tapahtumat?',
        'Delete this account?': 'Poistetaanko tämä tili?',
        'Delete this transaction?': 'Poistetaanko tämä tapahtuma?',
        Description: 'Kuvaus',
        'Documents that need renumbering': 'Uudelleennumerointia vaativat tositteet',
        'Documents having no entries': 'Tyhjät tositteet',
        Documents: 'Tositteet',
        'Edit Account': 'Muokkaa tiliä',
        'Email is required.': 'Email puuttuu.',
        Email: 'Email',
        'End Date': 'Loppuu',
        'Entries that has no tags': 'Tapahtumat, joissa ei ole yhtään tägiä',
        'Full name is required.': 'Käyttäjän koko nimi puuttuu.',
        'Full Name': 'Koko nimi',
        Home: 'Alkuun',
        'Initial balance': 'Alkusaldo',
        'Invalid credentials.': 'Kirjautuminen epäonnistui.',
        'Invalid database name.': 'Tietokannan nimi ei kelpaa.',
        'Total lines': 'Rivejä yhteensä',
        Locking: 'Lukitus',
        Locked: 'Lukittu',
        Login: 'Kirjaudu',
        'Login to Tilitintin': 'Kirjaudu Tilitinttiin',
        Logout: 'Poistu',
        'Mark as a favorite': 'Merkise suosikiksi',
        Name: 'Nimi',
        'No account selected': 'Ei valittua tiliä',
        'No Database Selected': 'Ei valittua tietokantaa',
        'No empty documents.': 'Ei tyhjiä tositteita',
        'No such account found.': 'Tiliä ei ole olemassa.',
        'no transactions': 'ei tapahtumia',
        'No User Selected': 'Ei valittua käyttäjää',
        No: 'Ei',
        'Numeric value incorrect.': 'Virheellinen numeroarvo.',
        Other: 'Muu',
        'Password is too short.': 'Salasana on liian lyhyt.',
        Password: 'Salasana',
        'Password Again': 'Salasana uudelleen',
        'Passwords do not match.': 'Salasanat ei täsmää.',
        'Payable to add': 'Lisättävä velkaa',
        'period {{period}}': 'tilikausi {{period}}',
        'Please select an account': 'Ole hyvä ja valitse tili',
        Periods: 'Tilikaudet',
        'Press Insert to create a transaction.': 'Voit luoda tapahtuman painamalla Insert.',
        'Receivable to add': 'Lisättävä saatavia',
        'Remove favorite status': 'Poista suosikeista',
        Reports: 'Raportit',
        'Saving failed.': 'Tallennus epäonnistui.',
        Search: 'Etsi',
        'Select database': 'Valitse kanta',
        'Select period': 'Valitse tilikausi',
        'Start Date': 'Alkaa',
        'Start new period?': 'Aloitetaanko uusi tilikausi?',
        Submit: 'Lähetä',
        'This database does not have configured VAT accounts.': 'Tässä tietokannassa ei ole konfiguroituna ALV-tilejä.',
        'This field is required.': 'Tämä kenttä ei voi olla tyhjä.',
        Tools: 'Työkalut',
        Total: 'Yhteensä',
        'This system has no admin user': 'Järjestelmästä puuttuu pääkäyttäjä',
        'Please register an admin user': 'Ole hyvä ja syötä pääkäyttäjän tiedot',
        Transactions: 'Tapahtumat',
        'Undefined tag.': 'Tägiä ei ole määritelty.',
        Unlocked: 'Auki',
        'Upload Database': 'Lähetä tiedosto',
        'User name is not valid (lower case letters and numbers only).': 'Käyttäjätunnus ei kelpaa (vain pienet kirjaimet ja numerot sallitaan)',
        User: 'Käyttäjä',
        'User creation failed.': 'Käyttäjän luonti epäonnistui.',
        Username: 'Käyttäjätunnus',
        Users: 'Käyttäjät',
        'Value Added Tax': 'Arvonlisävero',
        'VAT from purchases': 'ALV ostoista',
        'VAT from sales': 'ALV myynnistä',
        'VAT update': 'ALV päivitys',
        View: 'Katso',
        Yes: 'Kyllä',
        'You can upload old Tilitin file here.': 'Voit lähettää tästä olemassaolevan Tilitin-tiedoston.',
        'Note that a database with the same name is overridden automatically.': 'Huomaa, että jos samanniminen tietokanta on jo olemassa, se ylikirjoitetaan automaattisesti.',

        'report-balance-sheet-detailed': 'Tase tilierittelyin',
        'report-balance-sheet': 'Tase',
        'report-general-journal': 'Päiväkirja',
        'report-general-ledger': 'Pääkirja',
        'report-income-statement-detailed': 'Tuloslaskelma tilierittelyin',
        'report-income-statement': 'Tuloslaskelma',

        'icon-all-account-types': 'Valitse kaikki tyyppivalinnat',
        'icon-asset': 'Varat',
        'icon-create-period': 'Aloita uusi tilikausi',
        'icon-create-user': 'Luo uusi käyttäjä',
        'icon-disable-all': 'Piilota kaikki',
        'icon-download-csv': 'Lataa CSV-tiedostona',
        'icon-drop-empty-documents': 'Poista kaikki tyhjät tositteet',
        'icon-equity': 'Pääoma',
        'icon-expense': 'Menot',
        'icon-favorite': 'Suosikit',
        'icon-fix-vat-descriptions': 'Korjaa puuttuvat kuvaukset',
        'icon-liability': 'Velat',
        'icon-lock-period': 'Lukitse tilikausi',
        'icon-none-account-types': 'Poista kaikki tyyppivalinnat',
        'icon-option-byTags': 'Tägeittäin',
        'icon-option-compact': 'Tiivistetympi esitysmuoto',
        'icon-option-full': 'Koko vuosi',
        'icon-option-quarter1': 'Ensimmäinen neljännes',
        'icon-option-quarter2': 'Ensimmäinen puoli vuotta',
        'icon-option-quarter3': 'Kolme neljännestä',
        'icon-print': 'Tulosta',
        'icon-profit': 'Voitto',
        'icon-reset': 'Näytä kaikki',
        'icon-revenue': 'Tulot',
        'icon-sort-documents': 'Järjestä tositenumerot päivämääräjän mukaan',
        'icon-summarize-vat-period': 'Kerää ALV velat/saatavat',
        'icon-unlock-period': 'Poista tilikauden lukitus',
        'icon-upload-database': 'Lähetä palvelimelle vanha Tilitin tiedosto',
        'icon-new-database': 'Luo uusi tietokanta',

        'column-account-number': 'Nro',
        'column-balance': 'Saldo',
        'column-credit': 'Kredit',
        'column-date-and-accounts': 'Päiväys ja tilit',
        'column-debit': 'Debet',
        'column-document-number': 'Nro',
        'column-name-or-date': 'Tili / Päiväys',

        ASSET: 'Varat ja saatavat',
        LIABILITY: 'Velat',
        EQUITY: 'Pääoma',
        REVENUE: 'Tulot',
        EXPENSE: 'Menot',
        PROFIT_PREV: 'Edellisten tilikausien voitto',
        PROFIT: 'Voitto'
      }
    }
  },

  fallbackLng: 'en',
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

i18n.changeLanguage(localStorage.getItem('language') || 'fi');

export default i18n;
