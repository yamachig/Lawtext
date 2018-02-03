import io
import sys
import subprocess
from pathlib import Path

JS_PATH = Path(__file__).resolve().parents[2] / 'js'

if __name__ == '__main__':

    try:
        sys.stdout = io.TextIOWrapper(
            sys.stdout.buffer,
            encoding=sys.stdout.encoding,
            errors='backslashreplace',
            line_buffering=sys.stdout.line_buffering,
        )
    except:
        pass

    p = subprocess.run(
        [
            'node',
            str(JS_PATH / 'lib/lawtext.js'),
        ] + sys.argv[1:],
        shell=True,
        # stderr=subprocess.DEVNULL,
    )

    sys.exit(p.returncode)
