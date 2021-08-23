*** Keywords ***
Select First Period of DB
    [Documentation]                     Got to the home page and select first period of first database.
    ${db}                               Current DB
    ${period}                           Current Period
    ${already_there}                    Evaluate            ${db}!=None and ${period}!=None
    Return From Keyword If              ${already_there}
    Go To Dashboard
    Click Element                       A
    Click Element                       1

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
