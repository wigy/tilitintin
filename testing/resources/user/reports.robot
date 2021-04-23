*** Variables ***

${REPORT_SELECTION_FIRST_CIRCLE}        //*[contains(@class,'MuiAvatar-circle')][text()='1']
${COLLECT_REPORT_JS}                    SEPARATOR=\n
...      const report = document.evaluate('//table[contains(@class, "ReportDisplayTable")]//tr', document.body, null, XPathResult.ANY_TYPE, null);
...      const result = [];
...      while (true) {
...        const line = report.iterateNext();
...        if (!line) break;
...        let texts = [];
...        const cells = document.evaluate('./td', line, null, XPathResult.ANY_TYPE, null);
...        while (true) {
...          const cell = cells.iterateNext();
...          if (!cell) break;
...          texts = texts.concat(cell.innerText.trim().split('\\n'));
...        }
...        result.push(texts);
...      }
...     return result;
${TEMP}                               [['Päiväkirja', 'Robot Oy'], ['23.4.2021', '12345678-9'], ['Nro', 'Päiväys ja tilit', 'Debet', 'Kredit'], ['#15', '12.03.2021', '', ''], ['', '1900 Käteisvarat: Deposit of the company capital', '2 500,00€', '–'], ['', '2001 Osakepääoma: Deposit of the company capital', '–', '2 500,00€'], ['#16', '13.03.2021', '', ''], ['', '1900 Käteisvarat: Loan from Business Bank', '7 500,00€', '–'], ['', '2621 Pitkäaikainen rahoituslaitoslaina 1: Loan from Business Bank', '–', '7 500,00€'], ['#17', '13.03.2021', '', ''], ['', '1900 Käteisvarat: Loan from Investment Bank', '6 000,00€', '–'], ['', '2622 Pitkäaikainen rahoituslaitoslaina 2: Loan from Investment Bank', '–', '6 000,00€'], ['#22', '16.03.2021', '', ''], ['', '1900 Käteisvarat: Buy computer', '–', '300,00€'], ['', '7680 Atk-laitehankinnat (< 3v. kalusto): Buy computer', '241,94€', '–'], ['', '29392 Alv ostoista: Buy computer', '58,06€', '–'], ['#23', '16.03.2021', '', ''], ['', '1900 Käteisvarat: Buy mouse', '–', '10,00€'], ['', '7680 Atk-laitehankinnat (< 3v. kalusto): Buy mouse', '8,06€', '–'], ['', '29392 Alv ostoista: Buy mouse', '1,94€', '–'], ['#24', '16.03.2021', '', ''], ['', '1900 Käteisvarat: Sell 1h consultation', '100,00€', '–'], ['', '3000 Myynti: Sell 1h consultation', '–', '80,65€'], ['', '29391 Alv myynnistä: Sell 1h consultation', '–', '19,35€'], ['#25', '16.03.2021', '', ''], ['', '1900 Käteisvarat: Sell 2h consultation', '200,00€', '–'], ['', '3010 Myynti 2: Sell 2h consultation', '–', '161,29€'], ['', '29391 Alv myynnistä: Sell 2h consultation', '–', '38,71€']]

*** Keywords ***
Select Report
    [Documentation]                     Go to the report with the given identifier like `balance-sheet` or `income-statement`.
    [Arguments]                         ${report}
    Go To Reports
    Click Element                       id:SelectReport ${report}
    Wait Until Page Contains Element    ${REPORT_SELECTION_FIRST_CIRCLE}

Gather Report Data
    Return From Keyword                 ${TEMP}
    # ${data}                             Execute Javascript      ${COLLECT_REPORT_JS}
    # Return From Keyword                 ${data}
