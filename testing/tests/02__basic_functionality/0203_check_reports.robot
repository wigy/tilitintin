*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown

*** Variables ***
${JOURNAL_REPORT}      SEPARATOR=\n
...     Päiväkirja                                                                                       Robot Oy       |
...     23.4.2021                                                                                        12345678-9     |
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
...     .            29392 Alv ostoista: Buy computer	                                    58,06€	    –               |
...     /#[0-9]+/	16.03.2021		                                                        .           .               |
...     .            1900 Käteisvarat: Buy mouse	                                            –	        10,00€      |
...     .            7680 Atk-laitehankinnat (< 3v. kalusto): Buy mouse	                    8,06€	    –               |
...     .            29392 Alv ostoista: Buy mouse	                                        1,94€	    –               |
...     /#[0-9]+/	16.03.2021		                                                        .           .               |
...     .            1900 Käteisvarat: Sell 1h consultation	                                100,00€	    –               |
...     .            3000 Myynti: Sell 1h consultation	                                    –	        80,65€          |
...     .            29391 Alv myynnistä: Sell 1h consultation	                            –	        19,35€          |
...     /#[0-9]+/	16.03.2021		                                                        .           .               |
...     .            1900 Käteisvarat: Sell 2h consultation	                                200,00€	    –               |
...     .            3010 Myynti 2: Sell 2h consultation	                                –	        161,29€         |
...     .            29391 Alv myynnistä: Sell 2h consultation	                            –	        38,71€          |
...     END

*** Test Cases ***
Verify That Reports Are Correct
    #Login as User
    #Select First Period of DB
    #Select Report                       general-journal
    ${data}                             Gather Report Data
    Report Should Match                 ${data}     ${JOURNAL_REPORT}
#general-journal
#general-ledger
#balance-sheet
#balance-sheet-detailed
#income-statement
#income-statement-detailed
