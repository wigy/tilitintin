# Tilitintin

This is Web UI for [Tilitin](https://github.com/thelineva/tilitin).

## Setting up the system

You can run the service either with the [Docker](https://www.docker.com/) or
natively with the [Node](https://nodejs.org).

### Using Docker

Drop your *Tilitin* sqlite-databases to the directory `backend/databases/user` and then build
and launch the system
```
docker-compose up
```

### Using Node

First launch the backend
```
cd backend
npm start
```

In addition, the frontend is needed. Add an other console and launch
```
cd ui
npm start
```

## Features

### Tags

In the transaction description one can add *tags* to categorize them. One or more tags can
be added in the beginning of the description in square brackets, for example
`[DepartmentA][Sports]`. Then they must be defined in the database. You can do that by
```
cd backend
bin/tags.js <database> add <tag> <name> <picture> <type> <order>
```
Here *database* is the name of your database without `.sqlite` postfix, *tag* is the tag text
itself consisting of `[A-Za-z0-9]`, *name* is longer description of the tag, *picture* is URI
to the visual presentation of the tag, *type* is arbitrary classification of the tag and *order*
is numeric sorting order.

For example, to categorize sales by departments and sales persons can be done using
```
bin/tags.js mydb add Sport "Sport and outdoor" http://mysite.example.com/pics/sport.jpg Department 101
bin/tags.js mydb add Mobile "Phones and acessories" http://mysite.example.com/pics/phone.jpg Department 102
bin/tags.js mydb add IT "Computers and office equipment" http://mysite.example.com/pics/sport.jpg Department 103

bin/tags.js mydb add NE "Neil Example" http://mysite.example.com/persons/neil.jpg 'Sales Person' 201
bin/tags.js mydb add ME "Michel Example" http://mysite.example.com/persons/michel.jpg 'Sales Person' 202
```

In UI you can do filtering using the categories defined.

## Version History

### 2.0.1
  * Small fixes and optimization.

### 2.0
  * Material UI implemented.
  * Display postponed VAT accounts as well in VAT screen.
  * Download current account transactions as CSV.
  * Remove completely empty columns from tagged income statement.

### 1.1.3
  * Small fixes.
  * Last Bootstrap UI.

### 1.1.2
  * Calculate sum of debit and credit.
  * When selecting proposed text, set account entry as well based on history.
  * Keyboard shortcuts for switching between periods.
  * Tool to remove empty entries.
  * Avoid crash if clipboard not supported.
  * Fix rounding error in balance calculations.
  * Fix some scrolling issues when editing near bottom of the screen.
  * Fix problems with report period when switching between periods.
  * Allow editing account name and number even if it has transactions.
  * Copy paste for description now includes tags.
  * Renumbering tool is not enabled for locked periods (back-end already refused to change anything).

### 1.1.1
  * Fix broken build.

### 1.1.0
  * Copy paste support.
  * Insert always creates new document and tab new entry.
  * More visible selection marker for date cell.
  * Fix crash when editing and changing to account that has no entries yet.
  * Fix when just created empty row and one edits old row, saving does not fail anymore.

### 1.0.2
  * Fix crash after automatically creating documents like VAT.
  * If you change account on tx, update document views correctly.
  * Report now invalidated after creating an entry without refresh.
  * Fix `password too short` error.
  * CORS problem with file uploading fixed.
  * Production build.
  * Fix crash when at home screen pressing `A` and `1` quickly.

### 1.0.1
  * Fix unmounted component error.
  * Add back creation of first transaction.
  * Restore automatic row insertion when pressing tab on last cell.

### 1.0
  * Rewritten transaction model.
  * Logo.

### 0.9.1
  * Refine date handling to be Tilitin compatible.
  * Changing language.
  * Loading indicator.

### 0.9
  * User management.
  * Creating and uploading database.
  * Refine tag image handling.
  * New navigation system with keyboard shortcuts.
  * Edit account.

### 0.8
  * Account listing and filtering.
  * Toggling account favorite status.
  * Account search.
  * Creating and deleting accounts.
  * Improved description proposals digging from historical values.

### 0.7
  * Automatically offered proposals for transaction editing.
  * Change cursor while running network operation.

### 0.6
  * Tools page for VAT handling, document renumbering, period locking.
  * Closing and creating new period.
  * Show tags as well on opened transaction.

### 0.5
  * Editing tags in description.
  * Income report sorted by tag.
  * Storing tag images on the server.
  * Cleaner error handling.

### 0.4
  * Refactor store to use models.
  * Refactor navigation to move more responsibility to models.
  * Clean up navigation code in general.
  * Quarter options for income and balance reports.

### 0.3
  * Simple one environment configurable account for authentication.
  * Basic navigation and editing of the original database.
  * Complete API for handling viewing, editing and reporting.
  * Full viewing and printing support for all original reports with additional options.
