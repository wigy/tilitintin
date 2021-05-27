*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown

*** Variables ***
${JOURNAL_REPORT}      SEPARATOR=\n
...     Päiväkirja                                                                                      Robot Oy        |
...     /\\d+\\.\\d+\\.\\d+/                                                                            12345678-9      |
...     Nro          Päiväys ja tilit                                                       Debet       Kredit          |
...     /#[0-9]+/    12.03.2021                                                             .           .               |
...     .            1900 Käteisvarat: Deposit of the company capital	                    2 500,00€	–               |
...     .            2001 Osakepääoma: Deposit of the company capital	                    –	        2 500,00€       |
...     /#[0-9]+/    13.03.2021                                                             .           .               |
...     .            1900 Käteisvarat: Loan from Business Bank	                            7 500,00€	–               |
...     .            2621 Pitkäaikainen rahoituslaitoslaina 1: Loan from Business Bank	    –	        7 500,00€       |
...     /#[0-9]+/	13.03.2021		                                                        .           .               |
...     .            1900 Käteisvarat: Loan from Investment Bank	                            6 000,00€	–           |
...     .            2622 Pitkäaikainen rahoituslaitoslaina 2: Loan from Investment Bank    –	        6 000,00€       |
...     /#[0-9]+/	16.03.2021		                                                        .           .               |
...     .            1900 Käteisvarat: Buy computer	                                        –	        300,00€         |
...     .            7680 Atk-laitehankinnat (< 3v. kalusto): Buy computer	                241,94€	    –               |
...     .            29392 Alv ostoista: Buy computer VAT 24%                               58,06€	    –               |
...     /#[0-9]+/	16.03.2021		                                                        .           .               |
...     .            1900 Käteisvarat: Buy mouse	                                            –	        10,00€      |
...     .            7680 Atk-laitehankinnat (< 3v. kalusto): Buy mouse	                    8,06€	    –               |
...     .            29392 Alv ostoista: Buy mouse VAT 24%                                  1,94€	    –               |
...     /#[0-9]+/	16.03.2021		                                                        .           .               |
...     .            1900 Käteisvarat: Sell 1h consultation	                                100,00€	    –               |
...     .            3000 Myynti: Sell 1h consultation	                                    –	        80,65€          |
...     .            29391 Alv myynnistä: Sell 1h consultation VAT 24%                      –	        19,35€          |
...     /#[0-9]+/	16.03.2021		                                                        .           .               |
...     .            1900 Käteisvarat: Sell 2h consultation	                                200,00€	    –               |
...     .            3010 Myynti 2: Sell 2h consultation	                                –	        161,29€         |
...     .            29391 Alv myynnistä: Sell 2h consultation VAT 24%                      –	        38,71€          |
...     END

${LEDGER_REPORT}      SEPARATOR=\n
...     Pääkirja                                                                                        Robot Oy                |
...     /\\d+\\.\\d+\\.\\d+/                                                                            12345678-9              |
...     Nro         Tili / Päiväys                                                          Debet       Kredit      Saldo       |
...     1900        Käteisvarat                                                             .           .           .           |
...     /#[0-9]+/   12.03.2021 Deposit of the company capital	                            2 500,00€	–	        2 500,00€   |
...     /#[0-9]+/   13.03.2021 Loan from Business Bank	                                    7 500,00€	–	        10 000,00€  |
...     /#[0-9]+/   13.03.2021 Loan from Investment Bank	                                6 000,00€	–	        16 000,00€  |
...     /#[0-9]+/   16.03.2021 Buy computer	                                                –	        300,00€	    15 700,00€  |
...     /#[0-9]+/   16.03.2021 Buy mouse	                                                –	        10,00€	    15 690,00€  |
...     /#[0-9]+/   16.03.2021 Sell 1h consultation	                                        100,00€	    –	        15 790,00€  |
...     /#[0-9]+/   16.03.2021 Sell 2h consultation	                                        200,00€	    –	        15 990,00€  |
...     .           .                                                                       .           .           15 990,00€  |
...     2001        Osakepääoma                                                             .           .           .           |
...     /#[0-9]+/   12.03.2021 Deposit of the company capital	                            –	        2 500,00€	-2 500,00€  |
...     .           .                                                                       .           .           -2 500,00€  |
...     2621	Pitkäaikainen rahoituslaitoslaina 1			                                .           .           .           |
...     /#[0-9]+/   13.03.2021 Loan from Business Bank	                                    –	        7 500,00€	-7 500,00€  |
...     .           .                                                                       .           .           -7 500,00€  |
...     2622	Pitkäaikainen rahoituslaitoslaina 2			                                .           .           .           |
...     /#[0-9]+/   13.03.2021 Loan from Investment Bank	                                –	        6 000,00€	-6 000,00€  |
...     .           .                                                                       .           .           -6 000,00€  |
...     29391	Alv myynnistä			                                                    .           .           .           |
...     /#[0-9]+/   16.03.2021 Sell 1h consultation VAT 24%                                 –	        19,35€	    -19,35€     |
...     /#[0-9]+/   16.03.2021 Sell 2h consultation VAT 24%                                 –	        38,71€	    -58,06€     |
...     .           .                                                                       .           .           -58,06€     |
...     29392	Alv ostoista			                                                    .           .           .           |
...     /#[0-9]+/   16.03.2021 Buy computer VAT 24%                                         58,06€	    –	        58,06€      |
...     /#[0-9]+/   16.03.2021 Buy mouse VAT 24%                                            1,94€	    –	        60,00€      |
...     .           .                                                                       .           .           60,00€      |
...     3000	Myynti			                                                            .           .           .           |
...     /#[0-9]+/   16.03.2021 Sell 1h consultation	                                        –	        80,65€	    -80,65€     |
...     .           .                                                                       .           .           -80,65€     |
...     3010	Myynti 2			                                                        .           .           .           |
...     /#[0-9]+/   16.03.2021 Sell 2h consultation	                                        –	        161,29€	    -161,29€    |
...     .           .                                                                       .           .           -161,29€    |
...     7680	Atk-laitehankinnat (< 3v. kalusto)			                                .           .           .           |
...     /#[0-9]+/   16.03.2021 Buy computer	                                                241,94€	    –	        241,94€     |
...     /#[0-9]+/   16.03.2021 Buy mouse	                                                8,06€	    –	        250,00€     |
...     .           .                                                                       .           .           250,00€     |
...     END

${BALANCE_SHEET_REPORT}      SEPARATOR=\n
...     Tase                                    Robot Oy    |
...     /\\d+\\.\\d+\\.\\d+/                    12345678-9  |
...     .                             /\\d+\\.\\d+\\.\\d+/  |
...     VASTAAVAA                               .           |
...     PYSYVÄT VASTAAVAT                       .           |
...     VAIHTUVAT VASTAAVAT                     .           |
...     Rahat ja pankkisaamiset                 15 990,00€  |
...     Vaihtuvat vastaavat yhteensä            15 990,00€  |
...     Vastaavaa yhteensä                      15 990,00€  |
...     .                                       .           |
...     VASTATTAVAA                             .           |
...     OMA PÄÄOMA                              .           |
...     Osakepääoma                             2 500,00€   |
...     Tilikauden voitto (tappio)              -8,06€      |
...     Oma pääoma yhteensä                     2 491,94€   |
...     VIERAS PÄÄOMA                           .           |
...     Lainat rahoituslaitoksilta              13 500,00€  |
...     Muut velat                              -1,94€      |
...     Vieras pääoma yhteensä                  13 498,06€  |
...     Vastattavaa yhteensä                    15 990,00€  |
...     END

${BALANCE_SHEET_DETAILED_REPORT}      SEPARATOR=\n
...     Tase tilierittelyin                         Robot Oy    |
...     /\\d+\\.\\d+\\.\\d+/                        12345678-9  |
...     .                                 /\\d+\\.\\d+\\.\\d+/  |
...     VASTAAVAA                                   .           |
...     PYSYVÄT VASTAAVAT                           .           |
...     Pysyvät vastaavat yhteensä                  –           |
...     VAIHTUVAT VASTAAVAT                         .           |
...     Rahat ja pankkisaamiset                     .           |
...     1900 Käteisvarat                            15 990,00€  |
...     Rahat ja pankkisaamiset yhteensä            15 990,00€  |
...     Vaihtuvat vastaavat yhteensä                15 990,00€  |
...     Vastaavaa yhteensä                          15 990,00€  |
...     .                                           .           |
...     VASTATTAVAA                                 .           |
...     OMA PÄÄOMA                                  .           |
...     Osakepääoma                                 .           |
...     2001 Osakepääoma                            2 500,00€   |
...     Osakepääoma yhteensä                        2 500,00€   |
...     Tilikauden voitto (tappio)                  -8,06€      |
...     Oma pääoma yhteensä                         2 491,94€   |
...     VIERAS PÄÄOMA                               .           |
...     Lainat rahoituslaitoksilta                  .           |
...     2621 Pitkäaikainen rahoituslaitoslaina 1    7 500,00€   |
...     2622 Pitkäaikainen rahoituslaitoslaina 2    6 000,00€   |
...     Lainat rahoituslaitoksilta yhteensä         13 500,00€  |
...     Muut velat                                  .           |
...     29391 Alv myynnistä                         58,06€      |
...     29392 Alv ostoista                          -60,00€     |
...     Muut velat yhteensä                         -1,94€      |
...     Vieras pääoma yhteensä                      13 498,06€  |
...     Vastattavaa yhteensä                        15 990,00€  |
...     END

${INCOME_STATEMENT_REPORT}      SEPARATOR=\n
...     Tuloslaskelma                                           Robot Oy    |
...     /\\d+\\.\\d+\\.\\d+/                                    12345678-9  |
...     .                        /\\d+\\.\\d+\\.\\d+ - \\d+\\.\\d+\\.\\d+/  |
...     LIIKEVAIHTO                                             241,94€     |
...     Liiketoiminnan muut kulut                               -250,00€    |
...     LIIKEVOITTO (-TAPPIO)                                   -8,06€      |
...     VOITTO (TAPPIO) ENNEN SATUNNAISIA ERIÄ                  -8,06€      |
...     VOITTO (TAPPIO) ENNEN TILINPÄÄTÖSSIIRTOJA JA VEROJA     -8,06€      |
...     TILIKAUDEN VOITTO (TAPPIO)                              -8,06€      |
...     END

${INCOME_STATEMENT_DETAILED_REPORT}      SEPARATOR=\n
...     Tuloslaskelma tilierittelyin                            Robot Oy    |
...     /\\d+\\.\\d+\\.\\d+/                                    12345678-9  |
...     .                        /\\d+\\.\\d+\\.\\d+ - \\d+\\.\\d+\\.\\d+/  |
...     3000 Myynti                                             80,65€      |
...     3010 Myynti 2                                           161,29€     |
...     LIIKEVAIHTO                                             241,94€     |
...     Liiketoiminnan muut kulut                               .           |
...     7680 Atk-laitehankinnat (< 3v. kalusto)                 -250,00€    |
...     Liiketoiminnan muut kulut yhteensä                      -250,00€    |
...     LIIKEVOITTO (-TAPPIO)                                   -8,06€      |
...     VOITTO (TAPPIO) ENNEN SATUNNAISIA ERIÄ                  -8,06€      |
...     VOITTO (TAPPIO) ENNEN TILINPÄÄTÖSSIIRTOJA JA VEROJA     -8,06€      |
...     TILIKAUDEN VOITTO (TAPPIO)                              -8,06€      |
...     END

*** Test Cases ***
Verify That Reports Are Correct
    Login as User
    Change Language                     fi
    Select First Period of DB
    Select Report                       general-journal
    ${data}                             Gather Report Data
    Report Should Match                 ${data}     ${JOURNAL_REPORT}
    Select Report                       general-ledger
    ${data}                             Gather Report Data
    Report Should Match                 ${data}     ${LEDGER_REPORT}
    Select Report                       balance-sheet
    ${data}                             Gather Report Data
    Report Should Match                 ${data}     ${BALANCE_SHEET_REPORT}
    Select Report                       balance-sheet-detailed
    ${data}                             Gather Report Data
    Report Should Match                 ${data}     ${BALANCE_SHEET_DETAILED_REPORT}
    Select Report                       income-statement
    ${data}                             Gather Report Data
    Report Should Match                 ${data}     ${INCOME_STATEMENT_REPORT}
    Select Report                       income-statement-detailed
    ${data}                             Gather Report Data
    Report Should Match                 ${data}     ${INCOME_STATEMENT_DETAILED_REPORT}
