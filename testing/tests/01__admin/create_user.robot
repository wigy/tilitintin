*** Settings ***
Resource                            ../../resources/common.robot
Suite Setup                         Standard Suite Setup
Suite Teardown                      Standard Suite Teardown

*** Variables ***

${USER_LIST}                        //*[contains(@class, "UserList")]

*** Test Cases ***
Create New User
# TODO: At the moment we don't care duplicates but we should delete user afterwards.
    Login as Admin
    Click Element                   create-user
    Fill in Registration            ${TEST_USER}    ${TEST_PASSWORD}    ${TEST_EMAIL}
    Page Should Contain Element     ${USER_LIST}//*[text() = '${TEST_EMAIL}']
    Logout
