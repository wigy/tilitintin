#
# Requires:
# tests/10__initialize/10__create_user.robot tests/10__initialize/20__create_database.robot tests/20__transactions/02__insert_some_transactions.robot
#

*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown

*** Keywords ***
Clear Downloads
    ${DOWNLOADS}                        Get Download Directory
    Remove Files                        ${DOWNLOADS}/*.csv

*** Test Cases ***
Verify That Download Account CSV is Correct
    Login as User
    Select Default Database
    Clear Downloads
#    Go To Transactions
#    Select Account from Balances        1900
