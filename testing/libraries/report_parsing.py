import json

def report_should_match(report, format):
    """
    Compare `report` data collected from the screen to the report data defined in the `format`.
    """
    def compare_item(a, b):
        pass

    def compare_line(a, b):
        pass

    def compare_report(a, b):
        pass

    raise Exception('TODO: \n\n%r\n\n%r\n\n' % (json.loads(report.replace("'", '"')), format.split('|')))
