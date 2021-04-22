*** Keywords ***
Login As Admin
    Login As                            ${TEST_ADMIN_USER}      ${TEST_ADMIN_PASSWORD}

Login As User
    Login As                            ${TEST_USER}      ${TEST_PASSWORD}

Login As
    [Arguments]                         ${username}     ${password}
    ${current_user}                     Get Currently Logged User
    Return From Keyword If              ${current_user} == ${username}
    Go To                               ${TEST_BASE_URL}/
    Fill in Login                       ${username}     ${password}
    Wait Until Element is Enabled       HomeMenu
    Log to Console                      Logged in as ${username}

Logout
    Click Element                       LogoutMenu
    Wait Until Element is Visible       css:.LoginPage

Go To Dashboard
    Click Element                       HomeMenu
    Wait Until Element is Visible       css:.DatabasesPage

Go To Tools
    Click Element                       ToolsMenu
    Wait Until Element is Visible       css:.ToolsForDatabasesPage

Go To Transactions
    Click Element                       TransactionsMenu
    Wait Until Element is Visible       css:.TransactionsPage

Get Currently Logged User
    [Documentation]                     Find out the name of the currently logged user from the JWT token stored to local store.
    ${token}                            Execute Javascript      return localStorage.getItem('token')
    Return From Keyword If              '${token}' == 'None'
    ${jwt}                              Parse JWT Token         ${token}
    Return From Keyword If              not ${jwt}
    Return From Keyword If              not ${jwt}[login]
    Return From Keyword                 ${jwt}[user]
