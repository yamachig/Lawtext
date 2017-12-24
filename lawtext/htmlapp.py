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

    templates_js_path = Path(outdir / 'src' / 'templates.js')
    if not preserve_compiled_files or not templates_js_path.exists():
        outtext = subprocess.check_output([
            'nunjucks-precompile',
            '--include', '.+',
            str(Path(__file__).parent.resolve() / 'templates'),
        ], shell=True).decode(encoding='utf-8')
        write_text(templates_js_path, outtext)

    import_parse_decorate_js_path = Path(outdir / 'src' / 'parse_decorate.js')
    if not preserve_compiled_files or not import_parse_decorate_js_path.exists():
        subprocess.check_call([
            'transcrypt',
            '--build',
            '--esv', '5',
            '--fcall',
            '--dextex',
            '--nomin',
            '--xpath', str(Path(__file__).parents[1].resolve()),
            str(Path(__file__).parent.resolve() / '_parse_decorate.py'),
        ])
        outtext = (Path(__file__).parent.resolve() / '__javascript__' / '_parse_decorate.js').read_text(encoding='utf-8')
        outtext = outtext.replace('error.args', 'error.__args__')
        outtext = outtext.replace('join (self.args)', 'join (self.__args__)')
        outtext = outtext.replace(', __kwargtrans__ (kwargs)', ', __kwargtrans__ ([].slice.apply (arguments).slice (2))')
        write_text(import_parse_decorate_js_path, outtext)

    if ie:

        pd_path = Path(outdir / 'src' / 'parse_decorate.js')
        pd_text = pd_path.read_text(encoding='utf-8')
        pd_text = pd_text.replace(
            'new RegExp(pattern, jsFlags)',
            'new RegExp(pattern, jsFlags.replace("u", ""))',
        )
        pd_path.write_text(pd_text, encoding='utf-8')

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
