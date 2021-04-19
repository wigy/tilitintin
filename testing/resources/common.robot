*** Settings ***

Library                         SeleniumLibrary    timeout=20s    implicit_wait=3s    run_on_failure=Capture Page Screenshot    screenshot_root_directory=EMBED
Library                         OperatingSystem

*** Variables ***

${TEST_BASE_URL}                Not set
${TEST_ADMIN_USER}              Not set
${TEST_ADMIN_PASSWORD}          Not set

*** Keywords ***
Initialize
    ${TEST_BASE_URL}            Get Environment Variable    TEST_BASE_URL
    Set Global Variable         ${TEST_BASE_URL}
    Log to Console              Base URL is ${TEST_BASE_URL}
    ${TEST_ADMIN_USER}          Get Environment Variable    TEST_ADMIN_USER
    Set Global Variable         ${TEST_ADMIN_USER}
    Log to Console              Admin user is ${TEST_ADMIN_USER}
    ${TEST_ADMIN_PASSWORD}      Get Environment Variable    TEST_ADMIN_PASSWORD
    Set Global Variable         ${TEST_ADMIN_PASSWORD}

Login as Admin
    No Operation

Standard Suite Setup
    Initialize
    Open Browser                ${TEST_BASE_URL}/      Chrome

Standard Suite Teardown
    Close Browser
