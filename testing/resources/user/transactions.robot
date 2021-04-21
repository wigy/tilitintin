*** Keywords ***
Fill New Transaction Data
    [Documentation]                     Assume that we have freshly created transaction that has date field active.
    ...                                 This keyword fills in 2-part transaction with the given details.
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
