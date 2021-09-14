*** Keywords ***
    ${YEAR}                             Next Year

Chould Contains Table Row 2
    [Arguments]                         ${td1}  ${td2}
    Page Should Contain Element         //tr[td[text()='${td1}']/following-sibling::td[text()='${td2}']]
