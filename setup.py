from distutils.core import setup
from pathlib import Path

lawtext_dir = Path(__file__).parent / 'lawtext'

setup(
    name='lawtext',
    version='0.0.1',
    description='Plain text format for Japanese law',
    url='https://github.com/yamachig/lawtext',
    author='yamachi',
    license='MIT',
    packages=['lawtext'],
    package_data={'lawtext': [
        str(p.relative_to(lawtext_dir))
        for p in lawtext_dir.glob('**/*')
    ]},
    install_requires=['Jinja2', 'transcrypt'],
)
