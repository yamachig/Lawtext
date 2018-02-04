from distutils.core import setup
from pathlib import Path
from setuptools.command.install import install
from setuptools.command.develop import develop
import subprocess
import sys
import io
import os
import re
from pprint import pprint

lawtext_dir = Path(__file__).parent / 'lawtext'

try:
    sys.stdout = io.TextIOWrapper(
        sys.stdout.buffer,
        encoding=sys.stdout.encoding,
        errors='backslashreplace',
        line_buffering=sys.stdout.line_buffering,
    )
except:
    pass

# python -m pip install -U https://github.com/pypa/pip/archive/master.zip
def prepare_node():
    print("prepare_node", file=sys.stderr)
    if os.name == 'nt':
        cp = re.search(rb'\d+', subprocess.check_output("chcp.com"))[0].decode()
        subprocess.run("chcp.com 65001")
        subprocess.run("pip install nodeenv")
        subprocess.run("nodeenv -p")
        subprocess.run("npm.cmd install ../js/")
    else:
        subprocess.run("nodeenv -p")
        subprocess.run("npm install ../js/")
    # if cp:
    #     subprocess.run(f"chcp.com {cp}")

class InstallCommand(install):
    def run(self):
        print("InstallCommand", file=sys.stderr)
        super().run()
        prepare_node()

class DevelopCommand(develop):
    def run(self):
        print("DevelopCommand", file=sys.stderr)
        super().run()
        prepare_node()

setup(
    name='lawtext',
    version='0.1.1',
    description='Plain text format for Japanese law',
    url='https://github.com/yamachig/lawtext',
    author='yamachi',
    license='MIT',
    packages=['lawtext'],
    package_data={'lawtext': [
        str(p.relative_to(lawtext_dir))
        for p in lawtext_dir.glob('**/*')
    ]},
    requires=['nodeenv'],
    cmdclass={
        'install': InstallCommand,
        'develop': DevelopCommand,
    },
)
