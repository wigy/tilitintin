# Robot Testing

This folder has a test setup for testing the whole system using UI.
Tests are organized so that it is one long story when all is executed.

When adding new material to the tests, the idea is that you execute
all tests before that point first. Then you can implement test in that
slot and just running that single test over and over again during the
development. Possibly manually cleaning up changed done by your test
in between. Once ready, run the remaining tests to complete cycle.
After that you should verify that whole story will be executed successfully.

Tests should have requirement section on the top describing that what
is the minimal set of preparations required before that text. That makes
it easier to reproduce test faster.

## Requirements

You need Python and [Robot Framework](https://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html)
```
pip install -r requirements.txt
```
Also Chrome driver needs to be downloaded from https://sites.google.com/chromium.org/driver/

## Running Tests

Full test scripts can be found from `bin`. They should work as an examples for running
smaller parts of the tests.

## Custom Functions

The following Robot Framework custom functions are available:

### Current Year

Returns the current year as a string.

### Next Year

Returns the next year as a string.

### Parse JWT Token

Parse the content of the given JWT token and return it as a dict.

### Report Should Match

Compare a report parsed from the UI with the given string and fail if
they don't match. The format can be given as a formatted variable.

```
${JOURNAL_REPORT}      SEPARATOR=\n
...     Päiväkirja                                                                                      Robot Oy        |
...     23.4.2021                                                                                       12345678-9      |
...     Nro          Päiväys ja tilit                                                       Debet       Kredit          |
...     /#[0-9]+/    12.03.2021                                                             .           .               |
```

The format is split to lines is split from `|` and then to cells from multiple spaces.
Each cell is compared to the content found from the report table. By default they are
compared as exact matching strings. Few special notations are used:

* `/regex/` - If string starts and ends with `/` it is used as regex and matched against the cell content. Use `\\` for `\`.
* `.` - A single dot can be used to denote empty cell.
* `END` - By default report can have extra lines. If `END` is given as the last line, the report must have no extra lines.
