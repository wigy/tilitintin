*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown


*** Test Cases ***
Verify That Reports Are Correct
    Login as User
    Select First Period of DB
    Select Report                       general-journal
    Sleep                               500ms
    Gather Report Data
#general-journal
#general-ledger
#balance-sheet
#balance-sheet-detailed
#income-statement
#income-statement-detailed
