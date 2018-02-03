import subprocess
import json
from pathlib import Path
from .util import xml_to_json

JS_PATH = Path(__file__).resolve().parents[2] / 'js'

def run(
    intype,
    outtype,
    infile=None,
    outfile=None,
    analysis_file=None,
    noanalyze=False,
    with_control_el=False,
    intext=None,
):

    opts = []
    opts += ['--intype', intype]
    opts += ['--outtype', outtype]
    if infile: opts.append(infile)
    if outfile: opts.append(outfile)
    if analysis_file: opts.append('--analysis-file')
    if noanalyze: opts.append('--noanalyze')
    if with_control_el: opts.append('--with-control-el')

    arg = [
        'node',
        str(JS_PATH / 'lib/lawtext.js'),
    ] + opts

    kwargs = {
        'shell': True,
        'check': True,
        'stdout': subprocess.PIPE,
    }

    if intext:
        kwargs['input'] = intext.encode(encoding='utf-8')
    else:
        kwargs['stdin'] = subprocess.PIPE

    p = subprocess.run(arg, **kwargs)

    out = None
    if p.stdout:
        if outtype == 'docx':
            out = p.stdout
        else:
            out = p.stdout.decode(encoding='utf-8')

    return out

def parse(text, with_control_el=True, noanalyze=False):
    outtext = run(
        'lawtext', 'json',
        intext=text,
        with_control_el=with_control_el,
        noanalyze=noanalyze,
    )
    return json.loads(outtext)

def render_lawtext(law, noanalyze=True):
    return run('json', 'lawtext', intext=json.dumps(law), noanalyze=noanalyze)

def render_docx(law, noanalyze=False):
    return run('json', 'docx', intext=json.dumps(law), noanalyze=noanalyze)

def render_xml(law, with_control_el=False, noanalyze=True):
    return run(
        'json', 'xml',
        intext=json.dumps(law),
        with_control_el=with_control_el,
        noanalyze=noanalyze,
    )

def render_html(law, noanalyze=False):
    return run(
        'json', 'html',
        intext=json.dumps(law),
        noanalyze=noanalyze,
    )

def render_htmlfragment(law, noanalyze=False):
    return run(
        'json', 'htmlfragment',
        intext=json.dumps(law),
        noanalyze=noanalyze,
    )

