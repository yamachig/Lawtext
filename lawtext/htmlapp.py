import argparse
import locale
import os
import shutil
import subprocess
import sys
from distutils.dir_util import copy_tree
from pathlib import Path
from shutil import rmtree

from jinja2 import Environment, FileSystemLoader

env = Environment(loader=FileSystemLoader(str(Path(__file__).parent.resolve() / 'htmlapp_templates'), encoding='utf8'))

def write_text(path, text):
    path.parent.mkdir(exist_ok=True, parents=True)
    path.touch()
    path.write_text(text, encoding='utf-8')

def main(outdir, preserve_compiled_files, ie=False):
    os.environ["PATH"] += os.pathsep + str(Path(__file__).resolve().parents[1] / 'node_modules/.bin')

    outdir = Path(outdir).resolve()
    if outdir.exists():
        rmtree(str(outdir))

    copy_tree(
        str(Path(__file__).parent.resolve() / 'htmlapp_templates'),
        str(outdir),
    )

    shutil.copyfile(
        str(Path(__file__).parent.resolve() / 'static' / 'law.css'),
        str(Path(outdir / 'src' / 'law.css')),
    )

    for pegjs in (Path(__file__).parent.resolve() / 'js').glob('*.pegjs'):
        cache = pegjs.stem in []#['annotate_html']
        args = ['pegjs']
        if cache:
            args.append('--cache')
        args += [
            '--allowed-start-rules', 'start,INLINE',
            '-o',
            str(pegjs.parent / f'{pegjs.stem}.js'),
            str(pegjs),
        ]
        subprocess.check_call(args, shell=True)

    subprocess.check_call([
        'browserify',
        str(Path(__file__).parent.resolve() / 'js' / 'lawtext.js'),
        '-o',
        str(Path(outdir / 'src' / 'lawtext_parse.js')),
    ], shell=True)

    templates_js_path = Path(outdir / 'src' / 'templates.js')
    if not preserve_compiled_files or not templates_js_path.exists():
        outtext = subprocess.check_output([
            'nunjucks-precompile',
            '--include', '.+',
            str(Path(__file__).parent.resolve() / 'templates'),
        ], shell=True).decode(encoding='utf-8')
        write_text(templates_js_path, outtext)

    if ie:

        es6_files = list(Path(outdir / 'src').glob('*.js'))
        es6_files += list(Path(outdir / 'templates').glob('*.html'))
        for path in es6_files:
            print(f'Converting {path.name} for IE')
            out_path = path.parent / ('ie_' + path.name)
            subprocess.check_call([
                'babel',
                '--no-babelrc',
                str(path.resolve()),
                '--out-file', str(out_path.resolve()),
                '--presets', 'es2015',
            ], shell=True)



if __name__ == '__main__':
    argparser = argparse.ArgumentParser()
    argparser.add_argument('outdir')
    argparser.add_argument('-p', '--preserve-compiled-files', action='store_true')
    argparser.add_argument('-ie', action='store_true')
    args = argparser.parse_args()
    main(**vars(args))
