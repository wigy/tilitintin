*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown

*** Test Cases ***
Create First Few Transactions
    Login as User
    ${token}     Execute Javascript      return localStorage.getItem('token')
    Log to Console    TOKEN: ${token}

Create First Few Transactions Real
    [Tags]      skip
    Login as User
    Click Element                       A
    Click Element                       1
    Click Element                       Add Transaction
    Click Element                       Select Account
    Scroll Element Into View            Account 1900
    Click Element                       Account 1900
    Click Element                       OK
    Fill New 2-Part Income Tx           12.3.${YEAR}    Deposit of the company capital      2500    2001
    Click Element                       Add Transaction
    Fill New 2-Part Income Tx           13.3.${YEAR}    Loan from Business Bank             7500    2621
    Click Element                       Add Transaction
    Fill New 2-Part Income Tx           13.3.${YEAR}    Loan from Investment Bank           6000    2622
    Ensure Account Balance              1900    16 000,00€
    Ensure Account Balance              2001    -2 500,00€
    Ensure Account Balance              2621    -7 500,00€
    Ensure Account Balance              2622    -6 000,00€
