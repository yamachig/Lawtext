import subprocess
from pathlib import Path
import json

JS_PATH = Path(__file__).resolve().parent

def parse(text, with_analyzed=False):
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

    data = json.loads(outdata, encoding='utf-8')
    law = data['parsed']
    analyzed = data['analyzed']

    if with_analyzed:
        return law, analyzed
    else:
        return law
