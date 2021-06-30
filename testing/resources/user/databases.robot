*** Keywords ***
Select Database
    [Documentation]                     Select the given database.
    [Arguments]                         ${name}
    Go To Dashboard
    Click Element                       //*[contains(@class, "DatabaseList")]//*[text()='${name}']

Select Period
    [Documentation]                     Assume we have just selected database. Now select the given period.
    [Arguments]                         ${date_range}
    Wait Until Page Contains Element    period-${date_range}
    Click Element                       //*[@id="period-${date_range}"]//button
    Wait Until Page Contains Element    css:.BalanceTable
