*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown

*** Variables ***
${JOURNAL_REPORT}                       SEPARATOR=\t
...                                     Päiväkirja                                  Robot Oy
...                                     23.4.2021                                   12345678-9
...                                     Nro         Päiväys ja tilit    Debet       Kredit
...                                     /#[0-9]+/   12.03.2021

*** Test Cases ***
Verify That Reports Are Correct
    #Login as User
    #Select First Period of DB
    #Select Report                       general-journal
    ${data}                             Gather Report Data
    Log to Console    ${JOURNAL_REPORT}
    Report Should Match                 ${data}     ${JOURNAL_REPORT}
#general-journal
#general-ledger
#balance-sheet
#balance-sheet-detailed
#income-statement
#income-statement-detailed
