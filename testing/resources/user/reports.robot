*** Variables ***

${REPORT_SELECTION_FIRST_CIRCLE}        //*[contains(@class,'MuiAvatar-circle')][text()='1']
${COLLECT_REPORT_JS}                    SEPARATOR=\n
...      const report = document.evaluate('//table[contains(@class, "ReportDisplayTable")]//tr', document.body, null, XPathResult.ANY_TYPE, null);
...      const result = [];
...      while (true) {
...        const line = report.iterateNext();
...        if (!line) break;
...        const texts = [];
...        const cells = document.evaluate('./td', line, null, XPathResult.ANY_TYPE, null);
...        while (true) {
...          const cell = cells.iterateNext();
...          if (!cell) break;
...          texts.push(cell.innerText.trim());
...        }
...        result.push(texts);
...      }
...     return result;

*** Keywords ***
Select Report
    [Documentation]                     Go to the report with the given identifier like `balance-sheet` or `income-statement`.
    [Arguments]                         ${report}
    Go To Reports
    Click Element                       id:SelectReport ${report}
    Wait Until Page Contains Element    ${REPORT_SELECTION_FIRST_CIRCLE}

Gather Report Data
    ${data}                             Execute Javascript      ${COLLECT_REPORT_JS}
    Log to Console                      ${data}
