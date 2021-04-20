*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown

*** Variables ***

${DATABASE_CARD}                        //*[contains(@class, "Database")]

*** Test Cases ***
Create Database
# TODO: At the moment we don't care duplicates but we should delete database afterwards.
    Login as User
    Go To Tools
    Click Element                       New Database
    Input Text                          database-name        ${TEST_DATABASE}
    Input Text                          company-name         ${TEST_COMPANY}
    Input Text                          company-number       12345678-9
    Click Element                       OK
    Wait Until Page Contains Element    ${DATABASE_CARD}//*[text()='${TEST_DATABASE}']
