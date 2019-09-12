# Tilitintin

This is Web UI for [Tilitin](https://github.com/thelineva/tilitin).

## Setting up the system

You can run the service either with the [Docker](https://www.docker.com/) or
natively with the [Node](https://nodejs.org).

### Using Docker

Create a file `.env` using a file `.env.example` as a base.
Then drop your *Tilitin* sqlite-databases to the directory `backend/databases/user` and then build
and launch the system
```
docker-compose up
```

### Using Node

In this case you can just add symbolic links pointing to your *Tilitin* sqlite-databases to
the directory `backend/databases/user`. Then you launch the backend
```
cd backend
npm start
```

In addition, the frontend is needed. Add an other console and launch
```
cd ui
npm start
```

## Default user

Default user is `user` and password is `pass`.

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
