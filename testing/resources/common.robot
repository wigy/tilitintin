*** Settings ***
Library                                 SeleniumLibrary    timeout=5s    implicit_wait=1s
Library                                 OperatingSystem
Library                                 ../libraries/date_and_time.py
Library                                 ../libraries/security.py
Library                                 ../libraries/report_parsing.py
Resource                                ./admin/users.robot
Resource                                ./shared/navigation.robot
Resource                                ./user/transactions.robot
Resource                                ./user/reports.robot

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
    Log to Console                      Normal user emails is ${TEST_EMAIL}
    ${TEST_PASSWORD}                    Get Environment Variable    TEST_PASSWORD
    Set Global Variable                 ${TEST_PASSWORD}
    ${YEAR}                             Current Year
    Set Global Variable                 ${YEAR}

Standard Suite Setup
    Initialize Variables

Standard Suite Teardown
    No Operation
