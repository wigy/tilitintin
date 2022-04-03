*** Keywords ***
Clear Downloads
    Remove Files                        ${DOWNLOADS}/transactions-*-*.csv

Get Account Download File
    ${account}                          Current Account
    ${period}                           Current Period
    Return From Keyword                 ${DOWNLOADS}/transactions-${period}-${account}.csv

Check for Downloaded File
    [Arguments]                         ${path}
    Log to Console                      Waiting for file ${path}
    File Should Exist                   ${path}
    [Return]                            ${path}

Wait for Downloaded File
    [Arguments]                         ${path}
    Wait Until Keyword Succeeds         1 min    2 sec    Check for Downloaded File    ${path}

File Should Match
    [Arguments]                         ${path}     ${data}
    Compare Files                       ${path}     ${data}
