#
# Requires:
# tests/10__initialize/10__create_user.robot tests/10__initialize/20__create_database.robot tests/20__transactions/02__insert_some_transactions.robot tests/50__operations/10__vat.robot tests/50__operations/20__periods.robot
#

*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown

*** Test Cases ***
Test Bad Date Format and Proposal
    Login as User
    Change Language                     en
    Select Database                     robot
    Select Period                       ${NEXT_YEAR}-01-01-${NEXT_YEAR}-12-31
    Select Account from Balances        1900
    Press Keys                          None    CTRL+a

    # Localization format not right.
    Edit Transaction Cell               7.6.${NEXT_YEAR}
    Should Have Error Message           Date is incorrect.

    # Year is not right.
    Clear Transaction Cell
    Edit Transaction Cell               ${YEAR}-06-07
    Should Have Error Message           Date is before the current period starts.

    # Get it right.
    Clear Transaction Cell
    Edit Transaction Cell               ${NEXT_YEAR}-06-07

    # Fill some stuff. Test automatic proposal as well.
    Press Keys                          None    ARROW_RIGHT
    Wait Until Page Contains Element    ${SELECTED_DESCRIPTION}
    Edit Transaction Cell               Bought even more stuff
    Wait Until Page Contains Element    ${SELECTED_DEBIT}
    Edit Transaction Cell               500
    Wait Until Page Contains Element    ${SELECTED_CREDIT}
    Press Keys                          None    TAB
    Wait Until Page Contains Element    ${SELECTED_ACCOUNT}
    Edit Transaction Cell               4000
    Wait Until Page Contains Element    ${SELECTED_DESCRIPTION}
    Press Keys                          None    ARROW_RIGHT
    Press Keys                          None    ARROW_RIGHT
    Wait Until Page Contains Element    ${SELECTED_CREDIT}
    Press Keys                          None    ENTER
    Wait Until Page Contains Element    css:.proposal
    Press Keys                          None    ARROW_DOWN
    Press Keys                          None    ENTER

    # Check balances
    Account Balance Should Be           4000    -500,00€
    Account Balance Should Be           1900    16 490,00€
