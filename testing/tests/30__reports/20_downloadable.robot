#
# Requires:
# tests/10__initialize/10__create_user.robot tests/10__initialize/20__create_database.robot tests/20__transactions/02__insert_some_transactions.robot
#

*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown

*** Keywords ***
Account CSV Download Should Match
    [Arguments]                         ${account}
    Select Account from Balances        ${account}
    Click Element                       Download
    ${path}                             Get Account Download File
    Wait for Downloaded File            ${path}
    File Should Match                   ${path}         data/files/transactions-1-${account}.csv

*** Test Cases ***
Verify That Download Account CSV is Correct
    Login as User
    Change Language                     fi
    Select Default Database
    Clear Downloads
    Go To Transactions
    Account CSV Download Should Match   1900
    Account CSV Download Should Match   29391
    Account CSV Download Should Match   29392
    Account CSV Download Should Match   7680
