*** Settings ***
Library                             SeleniumLibrary    timeout=5s    implicit_wait=1s
Library                             OperatingSystem
Resource                            ./admin/users.robot

*** Variables ***

${TEST_BASE_URL}                    Not set
${TEST_ADMIN_USER}                  Not set
${TEST_ADMIN_PASSWORD}              Not set
${TEST_USER}                        Not set
${TEST_PASSWORD}                    Not set

*** Keywords ***
Initialize
    ${TEST_BASE_URL}                Get Environment Variable    TEST_BASE_URL
    Set Global Variable             ${TEST_BASE_URL}
    Log to Console                  Base URL is ${TEST_BASE_URL}
    ${TEST_ADMIN_USER}              Get Environment Variable    TEST_ADMIN_USER
    Set Global Variable             ${TEST_ADMIN_USER}
    Log to Console                  Admin user is ${TEST_ADMIN_USER}
    ${TEST_ADMIN_PASSWORD}          Get Environment Variable    TEST_ADMIN_PASSWORD
    Set Global Variable             ${TEST_ADMIN_PASSWORD}
    ${TEST_USER}                    Get Environment Variable    TEST_USER
    Set Global Variable             ${TEST_USER}
    Log to Console                  Normal user is ${TEST_USER}
    ${TEST_EMAIL}                   Get Environment Variable    TEST_EMAIL
    Set Global Variable             ${TEST_EMAIL}
    Log to Console                  Normal user emails is ${TEST_EMAIL}
    ${TEST_PASSWORD}                Get Environment Variable    TEST_PASSWORD
    Set Global Variable             ${TEST_PASSWORD}

Login As Admin
    Login As                        ${TEST_ADMIN_USER}      ${TEST_ADMIN_PASSWORD}

Login As
    [Arguments]                     ${username}     ${password}
    Go To                           ${TEST_BASE_URL}/
    Fill in Login                   ${username}     ${password}

Logout
    Click Element                   Logout

Standard Suite Setup
    Initialize
    Open Browser                    ${TEST_BASE_URL}/      Chrome

Standard Suite Teardown
    #Close Browser
    No Operation
