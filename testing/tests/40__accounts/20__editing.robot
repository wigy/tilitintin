*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown

*** Test Cases ***
Test Creating and Editing Accounts
    Login as User
    Select First Period of DB
   	Go To Accounts
    Click Element                       CreateNewAccount
    Input Text                          account_number  1915
    Input Text                          account_name    Standard Bank
    Click Element                       css:.account-type-dropdown
    Click Element                       //li[@data-value='ASSET']
    Click Element                       OK
    Wait Until Page Contains            1915 Standard Bank
