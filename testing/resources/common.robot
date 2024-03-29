*** Settings ***
Library                                 SeleniumLibrary    timeout=5s    implicit_wait=1s   run_on_failure=Capture Page Screenshot
Library                                 OperatingSystem
Library                                 XvfbRobot
Library                                 ../libraries/date_and_time.py
Library                                 ../libraries/security.py
Library                                 ../libraries/report_parsing.py
Library                                 ../libraries/downloading.py
Resource                                ./shared/files.robot
Resource                                ./shared/inspection.robot
Resource                                ./shared/navigation.robot
Resource                                ./shared/messages.robot
Resource                                ./shared/tables.robot
Resource                                ./admin/users.robot
Resource                                ./shared/misc.robot
Resource                                ./user/transactions.robot
Resource                                ./user/reports.robot
Resource                                ./user/accounts.robot
Resource                                ./user/databases.robot
Resource                                ./user/periods.robot

*** Variables ***

${TEST_BASE_URL}                        Not set
${TEST_ADMIN_USER}                      Not set
${TEST_ADMIN_PASSWORD}                  Not set
${TEST_USER}                            Not set
${TEST_PASSWORD}                        Not set
${TEST_DATABASE}                        robot
${TEST_COMPANY}                         Robot Oy
${YEAR}                                 0000

*** Keywords ***
Initialize Variables
    ${CI}                               Get Environment Variable    CI
    Set Global Variable                 ${CI}
    Log to Console                      Continuous Integration is ${CI}
    ${TEST_BASE_URL}                    Get Environment Variable    TEST_BASE_URL
    Set Global Variable                 ${TEST_BASE_URL}
    Log to Console                      Base URL is ${TEST_BASE_URL}
    ${TEST_ADMIN_USER}                  Get Environment Variable    TEST_ADMIN_USER
    Set Global Variable                 ${TEST_ADMIN_USER}
    Log to Console                      Admin user is ${TEST_ADMIN_USER}
    ${TEST_ADMIN_PASSWORD}              Get Environment Variable    TEST_ADMIN_PASSWORD
    Set Global Variable                 ${TEST_ADMIN_PASSWORD}
    ${TEST_USER}                        Get Environment Variable    TEST_USER
    Set Global Variable                 ${TEST_USER}
    Log to Console                      Normal user is ${TEST_USER}
    ${TEST_EMAIL}                       Get Environment Variable    TEST_EMAIL
    Set Global Variable                 ${TEST_EMAIL}
    Log to Console                      Normal user email is ${TEST_EMAIL}
    ${TEST_PASSWORD}                    Get Environment Variable    TEST_PASSWORD
    Set Global Variable                 ${TEST_PASSWORD}
    ${YEAR}                             Current Year
    Set Global Variable                 ${YEAR}
    ${NEXT_YEAR}                        Next Year
    Set Global Variable                 ${NEXT_YEAR}
    ${DOWNLOADS}                        Get Download Directory
    Set Global Variable                 ${DOWNLOADS}

Standard Suite Setup
    Initialize Variables

Standard Suite Teardown
    Clear Downloads
