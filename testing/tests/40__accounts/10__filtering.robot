*** Settings ***
Resource                                ../../resources/common.robot
Suite Setup                             Standard Suite Setup
Suite Teardown                          Standard Suite Teardown

*** Keywords ***
Page Should Contain Few Assets
	Page Should Contain					1900 Käteisvarat
	Page Should Contain					2001 Osakepääoma
	Page Should Contain					1161 Koneet ja laitteet
	Page Should Contain					1763 Arvonlisäverosaamiset

Page Should Contain Few Liabilities
	Page Should Contain					2871 Ostovelat 1
	Page Should Contain					29391 Alv myynnistä
	Page Should Contain					29392 Alv ostoista
	Page Should Contain					2939 Arvonlisäverovelka

Page Should Contain Few Equities
	Page Should Contain					2001 Osakepääoma

Page Should Contain Few Revenues
	Page Should Contain					3000 Myynti
	Page Should Contain					3470 Osinkotuotot
	Page Should Contain					3480 Korkotuotot
	Page Should Contain					9700 Satunnaiset tuotot

Page Should Contain Few Expenses
	Page Should Contain					4000 Ostot
	Page Should Contain					5000 Työntekijäpalkat
	Page Should Contain					5430 Puhelinedut
	Page Should Contain					9740 Satunnaiset kulut

Page Should Contain Profits
	Page Should Contain					2251 Edellisten tilikausien voitto/tappio

Page Should Contain All Account Types
	Page Should Contain Few Assets
	Page Should Contain Few Liabilities
	Page Should Contain Few Equities
	Page Should Contain Few Revenues
	Page Should Contain Few Expenses
	Page Should Contain Profits

*** Test Cases ***
Check Basic Account Listing
    Login as User
    Select First Period of DB
   	Go To Accounts
	Page Should Contain All Account Types
