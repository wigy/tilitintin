*** Variables ***
${FIND_DB_JS}                           return document.location.pathname.split('/')[1] || null
${FIND_PAGE_JS}                         return document.location.pathname.split('/')[2] || 'dashboard'
${FIND_PERIOD_JS}                       return document.location.pathname.split('/')[3] || null
${FIND_TX_JS}                           return document.location.pathname.split('/')[4] || null
${FIND_LANGUAGE}                        return localStorage.getItem('language') || 'en'

*** Keywords ***
Current DB
    ${data}                             Execute Javascript      ${FIND_DB_JS}
    Return From Keyword                 ${data}

Current Page
    ${data}                             Execute Javascript      ${FIND_PAGE_JS}
    Return From Keyword                 ${data}

Current Period
    ${data}                             Execute Javascript      ${FIND_PERIOD_JS}
    Return From Keyword                 ${data}

Current Account
    ${data}                             Execute Javascript      ${FIND_TX_JS}
    Return From Keyword                 ${data}

Current Language
    ${data}                             Execute Javascript      ${FIND_LANGUAGE}
    Return From Keyword                 ${data}
