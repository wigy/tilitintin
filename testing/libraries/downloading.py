import os

def get_download_directory() -> str:
    return os.path.realpath(os.path.join(os.path.dirname(__file__), '..', 'downloads'))
