*** Keywords ***
Lock Period
    [Arguments]                         ${period}
    Click Element                       //tr[@id="Period ${period}"]//*[@title="Lock period"]
