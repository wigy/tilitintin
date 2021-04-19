*** Settings ***
Resource                        ../../resources/common.robot
Suite Setup                     Standard Suite Setup
Suite Teardown                  Standard Suite Teardown

*** Test Cases ***
Create New User
    Login as Admin
