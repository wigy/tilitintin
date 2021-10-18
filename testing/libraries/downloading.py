import os

def get_download_directory() -> str:
    home = os.environ['HOME']
    if not home:
        raise Exception('HOME environment is not set.')
    downloads = os.path.realpath(os.path.join(home, 'Downloads'))
    if not os.path.exists(downloads):
        os.mkdir(downloads)
    return downloads
