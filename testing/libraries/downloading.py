import sys
import os

DEBUG = False

def get_download_directory() -> str:
    """
    Construct and return Downloads directory for the current HOME.
    """
    home = os.environ['HOME']
    if not home:
        raise Exception('HOME environment is not set.')
    downloads = os.path.realpath(os.path.join(home, 'Downloads'))
    if not os.path.exists(downloads):
        os.mkdir(downloads)
    return downloads

def compare_files(full_path, data_path):
    """
    Compare files line by line. The sample file is from data directory.
    """
    root = os.path.realpath(os.path.join(os.path.dirname(__file__), '..'))
    lines1 = open(full_path, 'r').read().split('\n')
    lines2 = open(os.path.join(root, data_path), 'r').read().split('\n')
    if DEBUG:
        sys.stderr.write('\n')
    for i in range(min(len(lines1), len(lines2))):
        if DEBUG:
            sys.stderr.write('Line %r:\n' % (i+1))
            sys.stderr.write('  %r\n' % lines1[i])
            sys.stderr.write('  %r\n' % lines2[i])
        if lines1[i] != lines2[i]:
            raise Exception('Line %r in file %r differs:\n%r\n%r\n' % (i+1, full_path, lines1[i], lines2[i]))
    if len(lines1) != len(lines2):
        raise Exception('Files %r and %r have different number of lines: %r vs %r.' % (full_path, data_path, len(lines1), len(lines2)))
