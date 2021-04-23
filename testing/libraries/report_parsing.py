import re
import sys
import json

first = True

def report_should_match(report, format):
    """
    Compare `report` data collected from the screen to the report data defined in the `format`.
    """

    def debug(*args):
        global first
        if first:
            sys.stderr.write('\n')
            first = False
        for i in range(len(args)):
            sys.stderr.write('DEBUG[%d]: %r\n' % (i, args[i]))

    def error(report, format, msg = 'Report does not match to format.'):
        format = '\t' + format.replace('\n', '\t').replace('|', '|\n')
        raise Exception('%s\nFormat:\n%s\nReport:\n%s\n\n' % (msg, format, report))

    def compare_item(report, format):
        format = format.strip()
        if format[0] == '/' and format[-1] == '/':
            regex = re.compile('^' + format[1:-1] + '$')
            if not regex.match(report):
                error(report, format)
        elif format == '.':
            if report.strip() != '':
                error(report, format)
        elif report != format:
            error(report, format)

    def compare_line(report, format):
        format = format.strip().split('\n')
        if len(report) != len(format):
            error(report, '\n'.join(format) + '|', 'Report line has different length than format.')
        for i in range(len(report)):
            compare_item(report[i], format[i])

    def compare_report(report, format):
        i = 0
        for line in format.split('|'):
            # Once format is finished, we don't care the rest.
            if line == '':
                break
            compare_line(report[i], line)
            i += 1

    report = json.loads(report.replace("'", '"')) # Convert test string. Not needed normally?
    compare_report(report, format)
    return True
