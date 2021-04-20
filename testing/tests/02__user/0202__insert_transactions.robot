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
