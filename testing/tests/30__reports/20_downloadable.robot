#
# Requires:
# tests/10__initialize/10__create_user.robot tests/10__initialize/20__create_database.robot tests/20__transactions/02__insert_some_transactions.robot
#

*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown

*** Test Cases ***
Verify That Download Account CSV is Correct
    Login as User
    Select Default Database
    Clear Downloads
    Go To Transactions
    Select Account from Balances        1900
    Click Element                       Download
    ${path}                             Get Account Download File
    Wait for Downloaded File            ${path}
