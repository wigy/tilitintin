*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown

*** Test Cases ***
Calculate VAT
    Login as User
    Change Language                     en
    Select First Period of DB
    Go To Tools
    Select Tool                         Value Added Tax
