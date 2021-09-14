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
    # Click Tool Icon                     Create Period
    # Click Element                       OK
    ${next}                             Next Year
    Chould Contains Table Row 2         ${next}-01-01   ${next}-12-31
