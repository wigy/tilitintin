*** Keywords ***

Wait Until No Loading Shadow
    # We need to wait just a bit in case the loading shadow is not yet in place.
    Sleep                               100ms
    Wait Until Element Is Not Visible   css:.MuiBackdrop-root   timeout=600

Click Element With text
    [Arguments]                         ${text}
    Click Element                       //*[text()='${text}']
