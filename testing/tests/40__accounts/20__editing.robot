#
# Requires:
# tests/10__initialize/10__create_user.robot tests/10__initialize/20__create_database.robot
#

*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown

*** Variables ***
${ACCOUNT_INFO_PANEL}                   //*[contains(@class, 'AccountInfoPanel')]
${ACCOUNT_INFO_NUMBER}                  ${ACCOUNT_INFO_PANEL}//*[@class='number']
${ACCOUNT_INFO_NAME}                    ${ACCOUNT_INFO_PANEL}//*[@class='name']
${ACCOUNT_INFO_TYPE}                    ${ACCOUNT_INFO_PANEL}//*[@class='type']

*** Test Cases ***
Test Creating Accounts
    Login as User
    Go To Starting URL                  # Need to hide possible selected account, since it disturbs test.
    Select First Period of DB
   	Go To Accounts
    Create New Account                  1915        Candy Bank              ASSET
    Create New Account                  2625        Loan for candy          LIABILITY
    Create New Account                  4005        Candy purchases         EXPENSE
    Create New Account                  3005        Candy sales             REVENUE

Browse Created Accounts
    Login as User
    Change Language                     en
    Select First Period of DB
   	Go To Accounts

    Select Account from Account List    1915
    Page Should Contain Element         ${ACCOUNT_INFO_NAME}//*[text()='Candy Bank']
    Page Should Contain Element         ${ACCOUNT_INFO_NUMBER}//*[text()='1915']
    Page Should Contain Element         ${ACCOUNT_INFO_TYPE}//*[text()='Assets']

    Select Account from Account List    2625
    Page Should Contain Element         ${ACCOUNT_INFO_NAME}//*[text()='Loan for candy']
    Page Should Contain Element         ${ACCOUNT_INFO_NUMBER}//*[text()='2625']
    Page Should Contain Element         ${ACCOUNT_INFO_TYPE}//*[text()='Liabilities']

    Select Account from Account List    4005
    Page Should Contain Element         ${ACCOUNT_INFO_NAME}//*[text()='Candy purchases']
    Page Should Contain Element         ${ACCOUNT_INFO_NUMBER}//*[text()='4005']
    Page Should Contain Element         ${ACCOUNT_INFO_TYPE}//*[text()='Expenses']

    Select Account from Account List    3005
    Page Should Contain Element         ${ACCOUNT_INFO_NAME}//*[text()='Candy sales']
    Page Should Contain Element         ${ACCOUNT_INFO_NUMBER}//*[text()='3005']
    Page Should Contain Element         ${ACCOUNT_INFO_TYPE}//*[text()='Revenue']

Edit Created Accounts
    [Tags]  skip
    Login as User
    Select First Period of DB
   	Go To Accounts
    Select Account from Account List    1915
    Click Element                       EditAccount
    Press Keys                          css:*[name="account_name"]      CTRL+A
    Press Keys                          None                            BACKSPACE
    Input Text                          account_name                    Candy Loan Sharks
    Click Element                       OK

    Select Account from Account List    2625
    Click Element                       EditAccount
    Press Keys                          css:*[name="account_number"]    CTRL+A
    Press Keys                          None                            BACKSPACE
    Input Text                          account_number                  2626
    Click Element                       OK

Browse Edited Accounts
    [Tags]  skip
    Login as User
    Change Language                     en
    Select First Period of DB
   	Go To Accounts

    Select Account from Account List    1915
    Page Should Contain Element         ${ACCOUNT_INFO_NAME}//*[text()='Candy Loan Sharks']
    Page Should Contain Element         ${ACCOUNT_INFO_NUMBER}//*[text()='1915']
    Page Should Contain Element         ${ACCOUNT_INFO_TYPE}//*[text()='Assets']

    Select Account from Account List    2626
    Page Should Contain Element         ${ACCOUNT_INFO_NAME}//*[text()='Loan for candy']
    Page Should Contain Element         ${ACCOUNT_INFO_NUMBER}//*[text()='2626']
    Page Should Contain Element         ${ACCOUNT_INFO_TYPE}//*[text()='Liabilities']

Delete Created and Edited Accounts
    [Tags]  skip
    Login as User
    Select First Period of DB
   	Go To Accounts

    Select Account from Account List    1915
    Click Element                       DeleteAccount
    Click Element                       OK
    Wait Until Element is Not Visible   css:.DeleteAccountDialog

    Select Account from Account List    2626
    Click Element                       DeleteAccount
    Click Element                       OK
    Wait Until Element is Not Visible   css:.DeleteAccountDialog

    Select Account from Account List    4005
    Click Element                       DeleteAccount
    Click Element                       OK
    Wait Until Element is Not Visible   css:.DeleteAccountDialog

    Select Account from Account List    3005
    Click Element                       DeleteAccount
    Click Element                       OK
    Wait Until Element is Not Visible   css:.DeleteAccountDialog

Verify That Accounts Are Deleted
    [Tags]  skip
    Login as User
    Select First Period of DB
   	Go To Accounts
    Page Should Not Contain             1915 Candy Bank
    Page Should Not Contain             2625 Loan for candy
    Page Should Not Contain             4005 Candy purchases
    Page Should Not Contain             3005 Candy sales
