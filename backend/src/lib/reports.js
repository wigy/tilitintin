const knex = require('./knex');

// Report formats. TODO: Take these from the DB.
const balanceSheet = `
HB0;1000;2000;VASTAAVAA
HB1;1000;1500;PYSYVÄT VASTAAVAT
GP2;1000;1100;Aineettomat hyödykkeet
TP3;1020;1030;Kehittämismenot
TP3;1030;1050;Aineettomat oikeudet
TP3;1050;1070;Liikearvo
TP3;1070;1090;Muut pitkävaikutteiset menot
TP3;1090;1100;Ennakkomaksut
TB2;1000;1100;Aineettomat hyödykkeet yhteensä
GP2;1100;1400;Aineelliset hyödykkeet
TP3;1100;1120;Maa- ja vesialueet
TP3;1120;1160;Rakennukset ja rakennelmat
TP3;1160;1300;Koneet ja kalusto
TP3;1300;1380;Muut aineelliset hyödykkeet
TP3;1380;1400;Ennakkomaksut ja keskeneräiset hankinnat
TB2;1100;1400;Aineelliset hyödykkeet yhteensä
GP2;1400;1500;Sijoitukset
TP3;1400;1410;Osuudet saman konsernin yrityksissä
TP3;1410;1420;Saamiset saman konsernin yrityksiltä
TP3;1420;1430;Osuudet omistusyhteysyrityksissä
TP3;1430;1440;Saamiset omistusyhteysyrityksiltä
TP3;1440;1470;Muut osakkeet ja osuudet
TP3;1470;1500;Muut saamiset
TB2;1400;1500;Sijoitukset yhteensä
TB1;1000;1500;Pysyvät vastaavat yhteensä
HB1;1500;2000;VAIHTUVAT VASTAAVAT
GP2;1500;1600;Vaihto-omaisuus
TP3;1500;1510;Aineet ja tarvikkeet
TP3;1510;1520;Keskeneräiset tuotteet
TP3;1520;1540;Valmiit tuotteet/tavarat
TP3;1540;1550;Muu vaihto-omaisuus
TP3;1550;1560;Ennakkomaksut
TB2;1500;1600;Vaihto-omaisuus yhteensä
GP2;1600;1860;Saamiset
TP3;1600;1630;1700;1730;Myyntisaamiset
TP3;1630;1640;1730;1740;Saamiset saman konsernin yrityksiltä
TP3;1640;1650;1740;1750;Saamiset omistusyhteysyrityksiltä
TP3;1650;1660;1750;1760;Lainasaamiset
TP3;1660;1670;1760;1780;Muut saamiset
TP3;1670;1680;1780;1800;Maksamattomat osakkeet/osuudet
TP3;1680;1690;1800;1850;Siirtosaamiset
TB2;1600;1860;Saamiset yhteensä
GP2;1860;1900;Rahoitusarvopaperit
TP3;1860;1870;Osuudet saman konsernin yrityksissä
TP3;1880;1890;Muut osakkeet ja osuudet
TP3;1890;1900;Muut arvopaperit
TP2;1860;1900;Rahoitusarvopaperit yhteensä
TP2;1900;2000;Rahat ja pankkisaamiset
TB1;1500;2000;Vaihtuvat vastaavat yhteensä
SB0;1000;2000;Vastaavaa yhteensä
--
HB0;2000;9999;VASTATTAVAA
HB1;2000;2400;OMA PÄÄOMA
TP2;2000;2020;Osakepääoma
TP2;2100;2110;Osuuspääoma
TP2;2150;2160;2180;2190;2340;2360;Pääomapanokset
TP2;2200;2210;2360;2370;Peruspääoma
TP2;2020;2030;Ylikurssirahasto
TP2;2030;2040;2110;2120;Arvonkorotusrahasto
GP2;2050;2100;Muut rahastot
TP3;2050;2060;Vararahasto
TP3;2060;2070;Yhtiöjärjestyksen tai sääntöjen mukaiset rahastot
TP3;2070;2100;Muut rahastot
TP2;2050;2100;Muut rahastot yhteensä
TP2;2250;2330;Edellisten tilikausien voitto (tappio)
TP2;2330;2340;Pääomavajaus
TP2;3000;9999;Tilikauden voitto (tappio)
TP2;2380;2390;Pääomalainat
TB1;2000;2400;3000;9999;Oma pääoma yhteensä
GB1;2400;2500;TILINPÄÄTÖSSIIRTOJEN KERTYMÄ
TP2;2400;2450;Poistoero
TP2;2450;2500;Vapaaehtoiset varaukset
TB1;2400;2500;Tilinpäätössiirtojen kertymä yhteensä
GB1;2500;2600;PAKOLLISET VARAUKSET
TP2;2500;2530;Eläkevaraukset
TP2;2530;2550;Verovaraukset
TP2;2550;2590;Muut pakolliset varaukset
TB1;2500;2600;Pakolliset varaukset yhteensä
HB1;2600;3000;VIERAS PÄÄOMA
TP2;2600;2610;2800;2810;Joukkovelkakirjalainat
TP2;2610;2620;2810;2820;Vaihtovelkakirjalainat
TP2;2620;2650;2820;2850;Lainat rahoituslaitoksilta
TP2;2650;2660;2850;2860;Eläkelainat
TP2;2660;2670;2860;2870;Saadut ennakot
TP2;2670;2690;2870;2890;Ostovelat
TP2;2690;2700;2890;2900;Rahoitusvekselit
TP2;2700;2710;2900;2910;Velat saman konsernin yrityksille
TP2;2710;2720;2910;2920;Velat omistusyhteysyrityksille
TP2;2720;2750;2920;2950;Muut velat
TP2;2750;2800;2950;3000;Siirtovelat
TB1;2600;3000;Vieras pääoma yhteensä
SB0;2000;9999;Vastattavaa yhteensä
`;

incomeStatement = `
SB0;3000;3600;LIIKEVAIHTO
TP0;3600;3630;Valmiiden ja keskeneräisten tuotteiden varastojen muutos
TP0;3630;3650;Valmistus omaan käyttöön
TP0;3650;4000;Liiketoiminnan muut tuotot
GP0;4000;5000;Materiaalit ja palvelut
GP1;4000;4450;Aineet, tarvikkeet ja tavarat
TP2;4000;4400;Ostot tilikauden aikana
TP2;4400;4450;Varastojen muutos
TP1;4450;5000;Ulkopuoliset palvelut
TP0;4000;5000;Materiaalit ja palvelut yhteensä
GP0;5000;6800;Henkilöstökulut
TP1;5000;6000;Palkat ja palkkiot
GP1;6000;6800;Henkilösivukulut
TP2;6000;6300;Eläkekulut
TP2;6300;6800;Muut henkilösivukulut
TP0;5000;6800;Henkilöstökulut yhteensä
GP0;6800;7000;Poistot ja arvonalentumiset
TP1;6800;6900;Suunnitelman mukaiset poistot
TP1;6900;6990;Arvonalentumiset pysyvien vastaavien hyödykkeistä
TP1;6990;7000;Vaihtuvien vastaavien poikkeukselliset arvonalentumiset
TP0;6800;7000;Poistot ja arvonalentumiset yhteensä
TP0;7000;8990;Liiketoiminnan muut kulut
SB0;3000;9000;LIIKEVOITTO (-TAPPIO)
GP0;9000;9700;Rahoitustuotot ja -kulut
TP1;9000;9040;Tuotot osuuksista saman konsernin yrityksissä
TP1;9040;9070;Tuotot osuuksista omistusyhteysyrityksissä
TP1;9080;9150;Tuotot muista pysyvien vastaavien sijoituksista
TP1;9150;9300;Muut korko- ja rahoitustuotot
TP1;9300;9370;Arvonalentumiset pysyvien vastaavien sijoituksista
TP1;9370;9420;Arvonalentumiset vaihtuvien vastaavien rahoitusarvopapereista
TP1;9420;9700;Korkokulut ja muut rahoituskulut
TP0;9000;9700;Rahoitustuotot ja -kulut yhteensä
SB0;3000;9700;VOITTO (TAPPIO) ENNEN SATUNNAISIA ERIÄ
GP0;9700;9800;Satunnaiset erät
TP1;9700;9740;Satunnaiset tuotot
TP1;9740;9780;Satunnaiset kulut
TP0;9700;9800;Satunnaiset erät yhteensä
SB0;3000;9800;VOITTO (TAPPIO) ENNEN TILINPÄÄTÖSSIIRTOJA JA VEROJA
TP0;9800;9900;Tilinpäätössiirrot
TP1;9800;9840;Poistoeron muutos
TP1;9840;9900;Vapaaehtoisten varausten muutos
TP0;9900;9980;Tuloverot
TP0;9980;9990;Muut välittömät verot
SB0;3000;9999;TILIKAUDEN VOITTO (TAPPIO)
`;

/**
 * Supported formats.
 */
const formats = {
  'balance-sheet': balanceSheet,
  'income-statement': incomeStatement
};

/**
 * Construct rendering information object based on the code.
 * @param {String} code
 */
function code2item(code) {
  let ret = {
    column: parseInt(code[2])
  };

  switch(code[0]) {
    case 'D':
      break;
    case 'H':
      ret.required = true;
      ret.hideTotal = true;
      break;
    case 'G':
      ret.hideTotal = true;
      break;
    case 'S':
      ret.required = true;
      break;
    case 'T':
      break;
  }

  switch(code[1]) {
    case 'B':
      ret.bold = true;
      break;
    case 'I':
      ret.italic = true;
      break;
  }

  return ret;
}

/**
 * Process data entries in to the report format described as in Tilitin reports.
 * @param {Object[]} entries
 * @param {String} format
 */
function processEntries(entries, format) {

  const DEBUG_PROCESSOR = false;

  if (!format) {
    return [];
  }

  // Summarize all totals from the entries.
  const totals = {'all': new Map()};
  entries.forEach((entry) => {
    totals.all[entry.number] = totals.all[entry.number] || 0;
    totals.all[entry.number] += entry.amount;
    // TODO: Calculate also by tags.
  });

  // Parse report and construct format.
  const allAccounts = Object.keys(totals['all']);
  let ret = [];
  format.split("\n").forEach((line) => {
    line = line.trim();
    if (line === '') {
      return;
    }
    if (line === '--') {
      ret.push({pageBreak: true});
      return;
    }
    const [code, ...parts] = line.split(';');
    const name = parts.pop();
    let amounts = {all: 0};
    let unused = true;
    let hits = [];
    let item = code2item(code);

    // Collect all totals inside any of the account number ranges.
    for (let i = 0; i < parts.length; i+=2) {
      const from = parts[i];
      const to = parts[i+1];
      allAccounts.forEach((number) => {
        if (number >= from && number < to) {
          unused = false;
          amounts.all += totals.all[number];
          if (DEBUG_PROCESSOR) {
            hits.push(number);
          }
        }
      });
    }

    // If debugging, just print all info.
    if (DEBUG_PROCESSOR) {
      ret.push({item, code, name, amounts, unused, parts, hits})
    } else {
      if (item.required || !unused) {
        item.name = name;
        item.amounts = amounts;
        ret.push(item);
      }
    }
  });

  return ret;
}

async function create(db, period, format) {
  return knex.db(db).select(
      'account.number',
      knex.db(db).raw('ROUND(((entry.debit == 1) * 2 - 1) * entry.amount * 100) as amount'),
      'entry.description'
    )
    .from('entry')
    .leftJoin('account', 'account.id', 'entry.account_id')
    .leftJoin('document', 'document.id', 'entry.document_id')
    .where({'document.period_id': period})
    .then((entries) => processEntries(entries, formats[format]));
}

module.exports = {
  formats,
  create
};
