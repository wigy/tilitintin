import re
import sys
import json

first = True
debug_whole = False
debug_lines = False
debug_comparison = False
line_number = None

def report_should_match(report, format):
    """
    Compare `report` data collected from the screen to the report data defined in the `format`.
    """
    global debug_whole

    def debug(prefix, *args):
        """
        Helper to print debug.
        """
        global first
        if first:
            sys.stderr.write('\n')
            first = False
        for i in range(len(args)):
            sys.stderr.write('DEBUG %s[%d]: %r\n' % (prefix, i + 1, args[i]))
        if not args:
            sys.stderr.write('DEBUG %s\n' % prefix)

    def error(report, format, msg = 'Report does not match to format.'):
        """
        Raise an excpetion and show error spot.
        """
        global line_number
        format = repr(format)
        raise Exception('%s\nLine number: %d\nFormat:\n%s\nReport:\n%s\n\n' % (msg, line_number, format, report))

    def compare_item(report, format):
        """
        Perform comparison to the single cells.
        """
        global debug_comparison
        format = format.strip()
        if debug_comparison:
            debug('    Compare format', format)
            debug('    Compare report', report)
        if format[0] == '/' and format[-1] == '/':
            regex = re.compile('^' + format[1:-1] + '$')
            if not regex.match(report):
                error(report, format)
        elif format == '.':
            if report.strip() != '':
                error(report, format)
        elif format == '-':
            if report.strip() not in ['-', '–']:
                error(report, format)
        elif report != format:
            error(report, format)

    def compare_line(report, format):
        """
        Compare one report line to the format.
        """
        format = format.strip().split('\n')
        if len(report) != len(format):
            error(report, format, 'Report line has different length than format.')
        for i in range(len(report)):
            compare_item(report[i], format[i])

    def is_finished(report):
        """
        Check if we have lines in report left and raise error if we do.
        """
        if len(report):
            error(report, 'END', 'Extra lines in the end of the report.')

    def compare_report(report, format):
        """
        Execute report and format comparison.
        """
        global line_number
        global debug_lines
        i = 0
        line_number = 1
        lines = format.split('|')
        for line in lines:
            if debug_lines:
                debug('  Format', line)
            # If END, then verify that report is finished.
            if line.strip() == 'END':
                is_finished(report[i:])
                break
            if i >= len(report):
                # Check the case where we have just one empty line remaining.
                if i == len(lines) - 1 and lines[i].strip() == '':
                    break
                error([], line, 'Report does not have enough lines.')
            if debug_lines:
                debug('  Line  ', report[i])
            # Once format is finished without END, we don't care the rest.
            if line == '':
                break
            compare_line(report[i], line)
            i += 1
            line_number += 1

    def prepare_report(report):
        """
        Trim empty lines away from the report.
        """
        def is_non_empty_line(line):
            return any(map(lambda cell: cell!='', line))
        return list(filter(lambda line: is_non_empty_line(line), report))

    def prepare_format(format):
        """
        Trim empty lines away from the report.
        """
        def is_non_empty_line(cells):
            return any(map(lambda cell: cell!='.', cells))
        non_empty = []
        for line in format.split('\n|\n'):
            cells = line.split('\n')
            if is_non_empty_line(cells):
                non_empty.append(cells)
        # TODO: Reconstructing it to back to string is pointless. Should use it as a list.
        return '\n|\n'.join(map(lambda cells: '\n'.join(cells), non_empty))

    # Allow quick testing from string copy pasted from console.
    if type(report) == str:
        report = json.loads(report.replace("'", '"'))

    report = prepare_report(report)
    format = prepare_format(format)
    if debug_whole:
        debug('Complete Format', *map(lambda s: s.split('\n'), format.split('\n|\n')))
        debug('Complete Report', *report)
    compare_report(report, format)
    return True
