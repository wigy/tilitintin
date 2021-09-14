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

    Chould Contains Table Row 4         1       ${YEAR}-01-01   ${YEAR}-12-31   Unlocked

    # Click Tool Icon                     Create Period
    # Click Element                       OK

    ${next}                             Next Year
    Chould Contains Table Row 4         2       ${next}-01-01   ${next}-12-31   Unlocked

# TODO: Check balances of the new period.

Lock a Period
    Lock Period                         ${YEAR}-01-01
    Chould Contains Table Row 4         1       ${YEAR}-01-01   ${YEAR}-12-31   Locked

# TODO: Check editing of locked period.
