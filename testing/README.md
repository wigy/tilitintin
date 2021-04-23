# Robot Testing

This folder has a test setup for testing the whole system using UI.
Tests are organized so that it is one long story when all is executed.

When adding new material to the tests, the idea is that you execute
all tests before that point first. Then you can implement test in that
slot and just running that single test over and over again during the
development. Possibly manually cleaning up changed done by your test
in between. Once ready, run the remaining tests to complete cycle.
After that you should verify that whole story will be executed successfully.
