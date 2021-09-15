#
# Requires:
# (Nothing)
#

*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown

*** Variables ***

${USER_LIST}                            //*[contains(@class, "UserList")]

*** Test Cases ***
Create New User
    Login as Admin
    Click Element                       create-user
    Fill in Registration                ${TEST_USER}    ${TEST_PASSWORD}    ${TEST_EMAIL}
    Wait Until No Loading Shadow
    Page Should Contain Element         ${USER_LIST}//*[text() = '${TEST_EMAIL}']
    Should Have Info Message            User created successfully.
    Logout
