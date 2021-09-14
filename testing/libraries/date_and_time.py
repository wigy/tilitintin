import datetime

def current_year() -> str:
    now = datetime.datetime.now()
    return str(now.year)

def next_year() -> str:
    now = datetime.datetime.now()
    return str(now.year + 1)
