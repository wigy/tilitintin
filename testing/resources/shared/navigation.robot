*** Keywords ***
Ensure Browser Is Open
    [Documentation]                     Check if the browser is not open and open it.
    Run Keyword If                      '${CI}'=='True'    Start Virtual Display               1920    1080
    ${ret}                              Run Keyword And Return Status       Execute Javascript      return 1
    Return From Keyword If              ${ret}
    Open Browser                        ${TEST_BASE_URL}/      Chrome
    Wait Until Element is Visible       css:.logo

Login As Admin
    Login As                            ${TEST_ADMIN_USER}      ${TEST_ADMIN_PASSWORD}

Login As User
    Login As                            ${TEST_USER}      ${TEST_PASSWORD}

Login As
    [Arguments]                         ${username}     ${password}
    Ensure Browser Is Open
    ${current_user}                     Get Currently Logged User
    Return From Keyword If              '${current_user}' == '${username}'
    Log to Console                      Want to be ${username} but we are ${current_user}
    Run Keyword If                      ${current_user}       Logout
    Go To Login
    Fill in Login                       ${username}     ${password}
    Wait Until Element is Enabled       HomeMenu
    Log to Console                      Logged in as ${username}
    Change Language                     en

Logout
    Log to Console                      Logging out
    Click Element                       LogoutMenu
    Wait Until Element is Visible       css:.LoginPage

Go To Login
    Go To                               ${TEST_BASE_URL}/
    Wait Until Element is Visible       css:.LoginPage

Go To Dashboard
    Click Element                       HomeMenu
    Wait Until Element is Visible       css:.DatabasesPage

Go To Transactions
    Click Element                       TransactionsMenu
    Wait Until Element is Visible       css:.TransactionsPage

Go To Reports
    Click Element                       ReportsMenu
    Wait Until Element is Visible       css:.ReportsPage

Go To Tools
    Click Element                       ToolsMenu
    Wait Until Element is Visible       css:.ToolsForDatabasesPage

Go To Admin
    Click Element                       AdminMenu
    Wait Until Element is Visible       css:.UserTools

Get Currently Logged User
    [Documentation]                     Find out the name of the currently logged user from the JWT token stored to local store.
    ${token}                            Execute Javascript      return localStorage.getItem('token')
    Return From Keyword If              '${token}' == 'None'
    ${jwt}                              Parse JWT Token         ${token}
    Return From Keyword If              not ${jwt}
    Return From Keyword If              not ${jwt}[login]
    Return From Keyword                 ${jwt}[user]

Wait For Title
    [Documentation]                     Wait until page subtitle is visible.
    [Arguments]                         ${title}
    # TODO: Should add class.
    Wait Until Element is Visible       //h5[text() = '${title}']
