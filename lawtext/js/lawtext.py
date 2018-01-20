import subprocess
from pathlib import Path
import json

JS_PATH = Path(__file__).resolve().parent

def parse(text):
    process = subprocess.Popen(
        [
            'node',
            str(JS_PATH / 'lawtext.js'),
        ],
        shell=True,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        # stderr=subprocess.DEVNULL,
    )
    indata = text.encode(encoding='utf-8')
    outdata, _ = process.communicate(indata)

    law = json.loads(outdata, encoding='utf-8')

    return law
