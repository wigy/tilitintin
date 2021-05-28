*** Keywords ***
Create New Account
    [Documentation]                     Start from the account page with the selected database.
    ...                                 This will create new account.
    [Arguments]                         ${number}     ${name}     ${type}
    Click Element                       CreateNewAccount
    Input Text                          account_number  ${number}
    Input Text                          account_name    ${name}
    Click Element                       css:.account-type-dropdown
    Wait Until Element Is Enabled       //li[@data-value='${type}']
    Click Element                       //li[@data-value='${type}']
    Click Element                       OK
    Wait Until Page Contains            ${number} ${name}

Select Account from Account List
    [Arguments]                         ${number}
    Wait Until Element is Enabled       css:#Account${number}
    Click Element                       css:#Account${number}
