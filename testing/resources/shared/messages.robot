*** Keywords ***
Change Language
    [Arguments]                         ${language}
    ${old}                              Current Language
    Return From Keyword If              '${old}' == '${language}'
    Execute Javascript                  localStorage.setItem('language', '${language}')
    Execute Javascript                  document.location.reload()
    Wait Until App Loaded

Should Have Any Error Message
    Page Should Contain Element         css:.Message.error

Should Have Any Info Message
    Page Should Contain Element         css:.Message.info

Should Have Error Message
    [Arguments]                         ${message}
    Page Should Contain Element         //*[contains(@class, "Message") and contains(@class, "error") and text() = '${message}']

Should Have Info Message
    [Arguments]                         ${message}
    Page Should Contain Element         //*[contains(@class, "Message") and contains(@class, "info") and text() = '${message}']
