*** Variables ***

${SELECTED_DATE}                        //*[contains(@class, "TransactionDetails")][contains(@class, "date")][contains(@class, "sub-selected")]
${SELECTED_ACCOUNT}                     //*[contains(@class, "TransactionDetails")][contains(@class, "account")][contains(@class, "sub-selected")]
${SELECTED_DESCRIPTION}                 //*[contains(@class, "TransactionDetails")][contains(@class, "description")][contains(@class, "sub-selected")]
${SELECTED_DEBIT}                       //*[contains(@class, "TransactionDetails")][contains(@class, "debit")][contains(@class, "sub-selected")]
${SELECTED_CREDIT}                      //*[contains(@class, "TransactionDetails")][contains(@class, "credit")][contains(@class, "sub-selected")]
${SELECTED_NEW_ROW}                     //*[@id="EntryNew"][.${SELECTED_DATE}]
${SELECTED_NEW_NUMBER}                  ${SELECTED_NEW_ROW}/td[contains(@class, "number")]
${CURRENTLY_SELECTED_ROW}               //tr[contains(@class, "Transaction")][contains(@class, "Mui-selected")]
${BALANCE_LINE}                         //tr[contains(@class, "BalanceLine")]

*** Keywords ***
Fill New 2-Part Income Tx
    [Documentation]                     Assume that we have freshly created transaction that has date field active.
    ...                                 This keyword fills in 2-part transaction with the given details.
    ...                                 Accounts with VAT are not usable.
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
    Wait Until Page Contains Element    ${SELECTED_CREDIT}
    Press Keys                          None    ESC
    Wait Until Page Does Not Contain Element    ${SELECTED_CREDIT}
    Press Keys                          None    ESC
    Press Keys                          None    ESC
    Wait Until Page Does Not Contain Element    ${CURRENTLY_SELECTED_ROW}

Ensure Account Balance
    [Documentation]                     This function assumest that we are on transaction page.
    ...                                 Check that we have correct balance for the given account.
    ...                                 Account is given as number and balance exact text with currency symbol and spacing.
    [Arguments]                         ${account}  ${balance}
    Go To Transactions
    Page Should Contain Element         //tr[contains(@class, "BalanceLine")][./td[contains(@class, "number")][text()="${account}"]][./td[contains(@class, "balance")]/*[text()="${balance}"]]
