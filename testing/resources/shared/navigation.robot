*** Keywords ***
Login As Admin
    Login As                        ${TEST_ADMIN_USER}      ${TEST_ADMIN_PASSWORD}

Login As User
    Login As                        ${TEST_USER}      ${TEST_PASSWORD}

Login As
    [Arguments]                     ${username}     ${password}
    Go To                           ${TEST_BASE_URL}/
    Fill in Login                   ${username}     ${password}

Logout
    Click Element                   Logout

Go To Tools
    Click Element                   Tools
