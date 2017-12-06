import argparse
import io
import re
import sys
import xml.etree.ElementTree as ET
from html import unescape
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen
from pprint import pformat

from lawtext import parse, render, util



def main(infile, intype=None, outfile=None, outtype=None):
    if not intype:
        if infile.startswith('http:') or infile.startswith('https:'):
            intype = 'web_xml'
        else:
            infilename = Path(infile).name
            if infile.startswith('http:') or infile.startswith('https:'):
                intype = 'web_xml'
            elif infilename.endswith('.xml'):
                intype = 'xml'
            elif infilename.endswith('.law.txt'):
                intype = 'lawtext'
            else:
                intype = 'lawtext'

    if not outtype:
        outfilename = Path(outfile).name if outfile else ''
        if outfilename.endswith('.xml'):
            outtype = 'xml'
        elif outfilename.endswith('.html'):
            outtype = 'html'
        elif outfilename.endswith('.law.txt'):
            outtype = 'lawtext'
        elif outfilename.endswith('.lexed.py'):
            outtype = 'lexed'
        elif outfilename.endswith('.docx'):
            outtype = 'docx'
        elif intype == 'xml':
            outtype = 'lawtext'
        elif intype == 'lawtext':
            outtype = 'xml'
        else:
            outtype = 'xml'

    if outtype == 'lexed' and intype != 'lawtext':
        raise ValueError('OUTTYPE=lexed can be used only with INTYPE=lawtext.')

    if intype == 'web_xml':
        def q(string):
            return quote(string.group(0))
        url = re.sub(r'[^ \x00-\x7f]+', q, infile)
        req = Request(url)
        req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36')
        with urlopen(req) as f:
            response = f.read().decode('utf-8')
        xml_el = ET.fromstring(response)
        xml = unescape(xml_el.find('.//LawFullText').text)
        law = util.xml_to_json(xml)
    elif intype == 'xml':
        xml = Path(infile).read_text(encoding='utf-8')
        law = util.xml_to_json(xml)
    elif intype == 'lawtext':
        lawtext = Path(infile).read_text(encoding='utf-8')
        if outtype == 'lexed':
            lexed = parse.lex(lawtext.splitlines())
        else:
            law = parse.parse_lawtext(lawtext)

    if outtype == 'docx':
        outbytes = render.render_docx(law)
        if outfile:
            Path(outfile).write_bytes(outbytes)
        else:
            sys.stdout.buffer.write(outbytes)
    else:
        if outtype == 'lawtext':
            outtext = render.render_lawtext(law)
        elif outtype == 'xml':
            outtext = render.render_xml(law)
        elif outtype == 'html':
            outtext = render.render_html(law)
        elif outtype == 'htmlfragment':
            outtext = render.render_htmlfragment(law)
        elif outtype == 'htmlfragment':
            outtext = render.render_htmlfragment(xml)
        elif outtype == 'lexed':
            outtext = pformat(lexed, indent=2)

        if outfile:
            Path(outfile).write_text(outtext, encoding='utf-8')
        else:
            print(outtext)



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

    argparser = argparse.ArgumentParser()
    argparser.add_argument('infile')
    argparser.add_argument(
        '-it', '--intype',
        choices=['lawtext', 'xml', 'web_xml'],
    )
    argparser.add_argument('outfile', nargs='?')
    argparser.add_argument(
        '-ot', '--outtype',
        choices=['lawtext', 'xml', 'html', 'htmlfragment', 'docx', 'lexed'],
    )
    args = argparser.parse_args()
    main(**vars(args))
