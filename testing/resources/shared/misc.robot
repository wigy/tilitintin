*** Keywords ***

Wait Until No Loading Shadow
    Wait Until Element Is Not Visible   css:.MuiBackdrop-root

Click Element With text
    [Arguments]                         ${text}
    Click Element                       //*[text()='${text}']
