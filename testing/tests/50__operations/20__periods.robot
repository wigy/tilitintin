#
# Requires:
# tests/10__initialize/10__create_user.robot tests/10__initialize/20__create_database.robot tests/20__transactions/02__insert_some_transactions.robot tests/50__operations/10__vat.robot
#

*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown

*** Test Cases ***
Create New Period
    Login as User
    Change Language                     en
    Select First Period of DB
    Go To Tools
    Select Tool                         Periods

    Should Contains Table Row 4         1       ${YEAR}-01-01   ${YEAR}-12-31   Unlocked

    Click Tool Icon                     Create Period
    Click Element                       OK

    ${NEXT}                             Next Year
    Should Contains Table Row 4         2       ${NEXT}-01-01   ${NEXT}-12-31   Unlocked

    Select Database                     robot
    Select Period                       ${NEXT}-01-01-${NEXT}-12-31

    Account Balance Should Be           1763	1,94€
    Account Balance Should Be           1900	15 990,00€
    Account Balance Should Be           2001	-2 500,00€
    Account Balance Should Be           2251	8,06€
    Account Balance Should Be           2621	-7 500,00€
    Account Balance Should Be           2622	-6 000,00€


Lock a Period
    Login as User
    Change Language                     en
    Select First Period of DB
    Go To Tools
    Select Tool                         Periods

    Lock Period                         ${YEAR}-01-01
    Should Contains Table Row 4         1       ${YEAR}-01-01   ${YEAR}-12-31   Locked

    Select Database                     robot
    Select Period                       ${YEAR}-01-01-${YEAR}-12-31
    Select Account from Balances        1900
    Select Named Tx                     Buy mouse
    Go To Line 1 Description
    Press Keys                          None    ENTER
    Should Have Error Message           Cannot edit this entry. Period locked?
