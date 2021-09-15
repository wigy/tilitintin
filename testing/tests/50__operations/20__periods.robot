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

    Click Tool Icon                     Create Period
    Click Element                       OK

    ${NEXT}                             Next Year
    Chould Contains Table Row 4         2       ${NEXT}-01-01   ${NEXT}-12-31   Unlocked

    Select Database                     robot
    Select Period                       ${NEXT}-01-01-${NEXT}-12-31

    Account Balance Should Be           1763	1,94€
    Account Balance Should Be           1900	15 990,00€
    Account Balance Should Be           2001	-2 500,00€
    Account Balance Should Be           2251	8,06€
    Account Balance Should Be           2621	-7 500,00€
    Account Balance Should Be           2622	-6 000,00€


#Lock a Period
#    Lock Period                         ${YEAR}-01-01
#    Chould Contains Table Row 4         1       ${YEAR}-01-01   ${YEAR}-12-31   Locked

# TODO: Check editing of locked period.
