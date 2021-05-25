*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup

*** Variables ***

${DATABASE_CARD}                        //*[contains(@class, "Database") and contains(@class, "MuiCardHeader")]
${TEST_DATABASE_CARD}                   ${DATABASE_CARD}//*[text()='${TEST_DATABASE}']

*** Test Cases ***
Try To Remove Database
    Login as User
    Change Language                     en
    Go To Tools
    Click Element                       ${TEST_DATABASE_CARD}/../../..//*[contains(@class,'DeleteDatabase')]
    Input Text                          name                ${TEST_DATABASE}FAIL
    Click Element                       OK
    Should Have Error Message           Database name was not given correctly.

Actually Remove Database
    Login as User
    Go To Tools
    Click Element                       ${TEST_DATABASE_CARD}/../../..//*[contains(@class,'DeleteDatabase')]
    Input Text                          name                ${TEST_DATABASE}
    Click Element                       OK
    Wait Until Page Does Not Contain Element    ${TEST_DATABASE_CARD}
    Should Have Info Message            Database deleted permanently.
