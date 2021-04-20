*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown

*** Variables ***


*** Test Cases ***
Create First Transaction
    Login as User
    Click Element                       A
    Click Element                       1
    Click Element                       Add Transaction
    Click Element                       Select Account
    Scroll Element Into View            Account 1900
    Click Element                       Account 1900
    Click Element                       OK
    # TODO: Wait for elements instead of sleep.
    Sleep                               100ms
    Press Keys                          None     1
    Press Keys                          None     2
    Press Keys                          None     .
    Press Keys                          None     3
    Press Keys                          None     .
    Press Keys                          None     2
    Press Keys                          None     0
    Press Keys                          None     2
    Press Keys                          None     1
    Press Keys                          None    ENTER
    Sleep                               100ms
    Press Keys                          None    ARROW_RIGHT
    Sleep                               100ms
    Press Keys                          None    Deposit of the company capital
    Press Keys                          None    ENTER
    Sleep                               100ms
    Press Keys                          None    2500
    Press Keys                          None    ENTER
    Sleep                               100ms
    Press Keys                          None    TAB
    Press Keys                          None    2001
    Press Keys                          None    ENTER
    Sleep                               100ms
    Press Keys                          None    TAB
    Press Keys                          None    TAB
    Press Keys                          None    2500
    Press Keys                          None    ENTER
