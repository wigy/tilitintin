#
# Requires:
# tests/10__initialize/10__create_user.robot
#

*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown

*** Test Cases ***
Create Database
    Login as User
    Go To Tools
    Click Element                       New Database
    Input Text                          database-name       ${TEST_DATABASE}
    Input Text                          company-name        ${TEST_COMPANY}
    Input Text                          company-number      12345678-9
    Click Element                       OK
    Wait For Title                      Periods
