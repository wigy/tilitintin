*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown

*** Variables ***

${SELECTED_DATE}                        //*[contains(@class, "TransactionDetails")][contains(@class, "date")][contains(@class, "sub-selected")]
${SELECTED_ACCOUNT}                     //*[contains(@class, "TransactionDetails")][contains(@class, "account")][contains(@class, "sub-selected")]
${SELECTED_DESCRIPTION}                     //*[contains(@class, "TransactionDetails")][contains(@class, "description")][contains(@class, "sub-selected")]
${SELECTED_DEBIT}                     //*[contains(@class, "TransactionDetails")][contains(@class, "debit")][contains(@class, "sub-selected")]
${SELECTED_CREDIT}                     //*[contains(@class, "TransactionDetails")][contains(@class, "credit")][contains(@class, "sub-selected")]
${SELECTED_NEW_ROW}                     //*[@id="EntryNew"][.${SELECTED_DATE}]
${SELECTED_NEW_NUMBER}                  ${SELECTED_NEW_ROW}/td[contains(@class, "number")]

*** Test Cases ***
Create First Transactions
    Login as User
    Click Element                       A
    Click Element                       1
    Click Element                       Add Transaction
    Click Element                       Select Account
    Scroll Element Into View            Account 1900
    Click Element                       Account 1900
    Click Element                       OK
    Fill New Transaction Data           12.3.${YEAR}    Deposit of the company capital      2500    2001
    Click Element                       Add Transaction
    Fill New Transaction Data           13.3.${YEAR}    Loan from Business Bank             7500    2621

*** Keywords ***
Fill New Transaction Data
    [Arguments]                         ${date}     ${desc}     ${amount}   ${account}
    Wait Until Page Contains Element    ${SELECTED_DATE}
    ${DOCUMENT_NUMBER}                  Execute Javascript   return document.evaluate('${SELECTED_NEW_NUMBER}', document.body, null, XPathResult.ANY_TYPE, null).iterateNext().innerText
    Set Global Variable                 ${DOCUMENT_NUMBER}
    Press Keys                          None    ${date}
    Press Keys                          None    ENTER
    Wait Until Page Contains Element    ${SELECTED_ACCOUNT}
    Press Keys                          None    ARROW_RIGHT
    Wait Until Page Contains Element    ${SELECTED_DESCRIPTION}
    Press Keys                          None    ${desc}
    Press Keys                          None    ENTER
    Wait Until Page Contains Element    ${SELECTED_DEBIT}
    Press Keys                          None    ${amount}
    Press Keys                          None    ENTER
    Wait Until Page Contains Element    ${SELECTED_CREDIT}
    Press Keys                          None    TAB
    Wait Until Page Contains Element    ${SELECTED_ACCOUNT}
    Press Keys                          None    ${account}
    Press Keys                          None    ENTER
    Wait Until Page Contains Element    ${SELECTED_DESCRIPTION}
    Press Keys                          None    TAB
    Wait Until Page Contains Element    ${SELECTED_DEBIT}
    Press Keys                          None    TAB
    Wait Until Page Contains Element    ${SELECTED_CREDIT}
    Press Keys                          None    ${amount}
    Press Keys                          None    ENTER
