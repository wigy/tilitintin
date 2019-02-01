# Tilitintin

This is Web UI for [Tilitin](https://github.com/thelineva/tilitin).

## Setting up the system

You can run the service either with the [Docker](https://www.docker.com/) or
natively with the [Node](https://nodejs.org).

### Using Docker

First drop your *Tilitin* sqlite-databases to the directory `backend/databases` and then build
and launch the system
```
docker-compose up
```

### Using Node

In this case you can just add symbolic links pointing to your *Tilitin* sqlite-databases to
the directory `backend/databases`. Then you launch the backend
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
bin/tags.js add <database> <tag> <name> <picture> <type> <order>
```
Here *database* is the name of your database without `.sqlite` postfix, *tag* is the tag text
itself consisting of `[A-Za-z0-9]`, *name* is longer description of the tag, *picture* is URI
to the visual presentation of the tag, *type* is arbitrary classification of the tag and *order*
is numeric sorting order.

For example, to categorize sales by departments and sales persons can be done using
```
bin/tags.js add mydb Sport "Sport and outdoor" http://mysite.example.com/pics/sport.jpg Department 101
bin/tags.js add mydb Mobile "Phones and acessories" http://mysite.example.com/pics/phone.jpg Department 102
bin/tags.js add mydb IT "Computers and office equipment" http://mysite.example.com/pics/sport.jpg Department 103

bin/tags.js add mydb NE "Neil Example" http://mysite.example.com/persons/neil.jpg 'Sales Person' 201
bin/tags.js add mydb ME "Michel Example" http://mysite.example.com/persons/michel.jpg 'Sales Person' 202
```

In UI you can do filtering using the categories defined.

## Version History

### 0.3
  * Simple one environment configurable account for authentication.
  * Basic navigation and editing of the imported database.
  * Complete API for handling viewing, editing and reporting.
  * Full viewing and printing support for all original reports with additional options.
