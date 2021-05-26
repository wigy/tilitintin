*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown

*** Test Cases ***
Create First Few Transactions
    Login as User
    Change Language                     fi
    Select First Period of DB
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

Create Some VAT Transactions
    Login as User
    Select First Period of DB
    Select Account from Balances        1900
    Click Element                       Add Transaction
    Fill New 3-Part VAT Expense Tx      16.3.${YEAR}    Buy computer                        300     7680
    Click Element                       Add Transaction
    Fill New 3-Part VAT Expense Tx      16.3.${YEAR}    Buy mouse                           10      7680
    Click Element                       Add Transaction
    Fill New 3-Part VAT Income Tx       16.3.${YEAR}   Sell 1h consultation                 100     3000
    Click Element                       Add Transaction
    Fill New 3-Part VAT Income Tx       16.3.${YEAR}   Sell 2h consultation                 200     3010
    Ensure Account Balance              1900    15 990,00€
    Ensure Account Balance              2001    -2 500,00€
    Ensure Account Balance              2621    -7 500,00€
    Ensure Account Balance              2622    -6 000,00€
    Ensure Account Balance              29391   -58,06€
    Ensure Account Balance              29392   60,00€
    Ensure Account Balance              7680    250,00€
    Ensure Account Balance              3000    -80,65€
    Ensure Account Balance              3010    -161,29€
