import i18n from 'i18next';

i18n.init({
    resources: {
      fi: {
        translations: {
          "Username": "Käyttäjätunnus",
          "Password": "Salasana",
          "Login": "Kirjaudu",
          "Select database": "Valitse kanta",
          "Select period": "Valitse jakso",
          "period {{period}}": "jakso {{period}}",
          "Account Balances": "Tilien saldot",
          "Transactions": "Tapahtumat",
          "Reports": "Raportit",
          "Accounts": "Tilit",
          "Logout": "Poistu",
          "Account scheme": "Tilikartta",
          "Date": "Päiväys",
          "Description": "Kuvaus",
          "Debit": "Debet",
          "Credit": "Kredit",
          "Total": "Yhteensä",

          "This field is required.": "Tämä kenttä ei voi olla tyhjä."
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

export default i18n;
