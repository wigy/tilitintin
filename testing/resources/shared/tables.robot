*** Keywords ***

Should Contains Table Row 2
    [Arguments]                         ${td1}  ${td2}
    Page Should Contain Element         //tr[td[1][.//text()='${td1}']][td[2][.//text()='${td2}']]

Should Contains Table Row 3
    [Arguments]                         ${td1}  ${td2}  ${td3}
    Page Should Contain Element         //tr[td[1][.//text()='${td1}']][td[2][.//text()='${td2}']][td[3][.//text()='${td3}']]

Should Contains Table Row 4
    [Arguments]                         ${td1}  ${td2}  ${td3}  ${td4}
    Page Should Contain Element         //tr[td[1][.//text()='${td1}']][td[2][.//text()='${td2}']][td[3][.//text()='${td3}']][td[4][.//text()='${td4}']]

Should Contains Table Row 5
    [Arguments]                         ${td1}  ${td2}  ${td3}  ${td4}  ${td5}
    Page Should Contain Element         //tr[td[1][.//text()='${td1}']][td[2][.//text()='${td2}']][td[3][.//text()='${td3}']][td[4][.//text()='${td4}']][td[5][.//text()='${td5}']]
