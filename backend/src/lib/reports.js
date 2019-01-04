const balanceSheet = `HB0;1000;2000;VASTAAVAA
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

function create(db, period, format) {
  return {db, period, format}
}

module.exports = {
  formats: {
    'balance-sheet': balanceSheet
  },
  create
};
