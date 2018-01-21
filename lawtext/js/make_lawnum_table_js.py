import hashlib
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

import requests


def main():
    response = requests.get(
        'http://elaws.e-gov.go.jp/api/1/lawlists/1',
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
        },
    )
    xml = response.text
    tree = ET.fromstring(xml)
    laws = [
        {
            'name': re.sub(r'　抄$', '', law.find('LawName').text),
            'num': law.find('LawNo').text,
        }
        for law in tree.findall('.//LawNameListInfo')
    ]

    data = {}
    table = ""
    for law in laws:
        m = hashlib.sha512(law['num'].encode(encoding='utf-16-be'))
        key = m.hexdigest()[:7]
        if key in data:
            print(f'collision: {law["num"]} {law["name"]} key:{key}', file=sys.stderr)
        length = len(law["name"])
        value = key + f'{length:02x}'
        data[key] = value
        table += value

    (Path(__file__).resolve().parent / 'lawnum_table.js').write_text(f'''\
"use strict";

var LAWNUM_TABLE = {{}};

if (typeof require !== 'undefined' && typeof exports !== 'undefined') {{
    exports.LAWNUM_TABLE = LAWNUM_TABLE;
}}

var LAWNUM_TABLE_RAW = "{table}";

for(let i = 0; i < LAWNUM_TABLE_RAW.length; i += 9) {{
    let key = parseInt(LAWNUM_TABLE_RAW.slice(i, i + 7), 16);
    let length = parseInt(LAWNUM_TABLE_RAW.slice(i + 7, i + 9), 16);
    LAWNUM_TABLE[key] = length;
}}
''')

if __name__ == '__main__':
    main()
