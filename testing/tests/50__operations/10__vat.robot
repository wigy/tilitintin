#
# Requires:
# tests/10__initialize/10__create_user.robot tests/10__initialize/20__create_database.robot tests/20__transactions/02__insert_some_transactions.robot
#

*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown

*** Test Cases ***
Calculate VAT
    Login as User
    Change Language                     en
    Select First Period of DB
    Go To Tools
    Select Tool                         Value Added Tax

    Page Should Contain                 Current VAT receivable: 0,00 €
    Page Should Contain                 Current VAT payable: 0,00 €
    Page Should Contain                 Cumulated VAT from purchases: 60,00 €
    Page Should Contain                 Cumulated VAT from sales: -58,06 €
    Page Should Contain                 Receivable to add: 1,94 €

    Click Tool Icon                     Summarize VAT

    Page Should Contain                 Current VAT receivable: 1,94 €
    Page Should Contain                 Current VAT payable: 0,00 €
    Page Should Contain                 Cumulated VAT from purchases: 0,00 €
    Page Should Contain                 Cumulated VAT from sales: 0,00 €
    Page Should Contain                 Receivable to add: 0,00 €

Verify VAT from Report
    Login as User
    Change Language                     fi
    Select First Period of DB

    Select Report                       balance-sheet
    Page Should Contain Report Line     Muut saamiset                       1,94€
    Page Should Contain Report Line     Muut velat                          0,00€

    Select Report                       balance-sheet-detailed
    Page Should Contain Report Line     1763 Arvonlisäverosaamiset          1,94€
    Page Should Contain Report Line     Muut saamiset yhteensä	            1,94€
    Page Should Contain Report Line     Saamiset yhteensä	                1,94€
