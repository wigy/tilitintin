#
# Requires:
# (Nothing)
#

*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup

*** Variables ***

*** Test Cases ***
Try To Remove User
    Login as Admin
    Go To Admin
    Select User From List               ${TEST_USER}
    Click Element                       delete-user
    Input Text                          deleted-user-email         ${TEST_EMAIL}FAIL
    Click Element                       OK
    Should Have Error Message           Email was not given correctly.

Actually Remove User
    Login as Admin
    Go To Admin
    Select User From List               ${TEST_USER}
    Click Element                       delete-user
    Input Text                          deleted-user-email         ${TEST_EMAIL}
    Click Element                       OK
    Should Have Info Message            User deleted permanently.
