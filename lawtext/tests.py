import io
import re
import sys
import time
import unittest
from abc import ABCMeta

import requests
import requests_cache

requests_cache.install_cache()

_web_law_cache = {}
_ref_text_cache = {}


class AbstractTest(unittest.TestCase, metaclass=ABCMeta):

    LAWS = [
        dict(zip(
            ['law_id', 'law_num', 'law_name'],
            values,
        ))
        for values in [
            ('359AC0000000086', '昭和五十九年法律第八十六号', '電気通信事業法'),
            ('322AC0000000067', '昭和二十二年法律第六十七号', '地方自治法'),
            ('325AC0000000131', '昭和二十五年法律第百三十一号', '電波法'),
            ('425AC0000000027', '平成二十五年法律第二十七号', '行政手続における特定の個人を識別するための番号の利用等に関する法律'),
            ('414AC0000000153', '平成十四年法律第百五十三号', '電子署名等に係る地方公共団体情報システム機構の認証業務に関する法律'),
            ('405AC0000000088', '平成五年法律第八十八号', '行政手続法'),
            ('406CO0000000265', '平成六年政令第二百六十五号', '行政手続法施行令'),
            # ('412M50001000064', '平成十二年郵政省令第六十四号', '第一種指定電気通信設備接続料規則'),
            ('428M60000008031', '平成二十八年総務省令第三十一号', '第二種指定電気通信設備接続料規則'),
            ('426M60000002044', '平成二十六年内閣府令第四十四号', '子ども・子育て支援法施行規則'),
            ('346AC0000000073', '昭和四十六年法律第七十三号', '児童手当法'),
            ('129AC0000000089', '明治二十九年法律第八十九号', '民法'),
        ]
    ]

    def _compare_text(self, lines_1, lines_2, lines, law_num):
        conc1 = ''.join(line[2:].rstrip() for line in lines_1)
        conc2 = ''.join(line[2:].rstrip() for line in lines_2)
        if conc1 == conc2:
            return
        if (len(lines) == 4 and
            lines[0] == '*** 1 ****' and
            lines[1] == f'- {law_num}' and
            lines[2] == '--- 0 ----' and
            lines[3] == '***************'):
            return
        if (len(lines) == 4 and
            lines[0] == '*** 2 ****' and
            lines[1] == '--- 2 ----' and
            lines[2] == f'+ （{law_num}）' and
            lines[3] == '***************'):
            return
        yield from lines

    def _compare_xml(self, lines_1, lines_2, lines, law_num, filename1='reference', filename2='output'):
        conc1 = '\n'.join(line[2:] for line in lines_1)
        conc2 = '\n'.join(line[2:] for line in lines_2)
        if conc1 == conc2:
            return

        conc1 = conc1.replace(' Year="0', ' Year="')
        conc1 = conc1.replace(' Extract="false"', '')
        conc1 = conc1.replace(' Delete="false"', '')
        conc1 = conc1.replace(' Hide="false"', '')
        conc1 = conc1.replace(' OldStyle="false"', '')
        conc1 = conc1.replace(' WritingMode="vertical"', '')
        conc1 = conc1.replace(' BorderTop="solid"', '')
        conc1 = conc1.replace(' BorderRight="solid"', '')
        conc1 = conc1.replace(' BorderBottom="solid"', '')
        conc1 = conc1.replace(' BorderLeft="solid"', '')
        conc1 = conc1.replace(' LineBreak="false"', '')

        conc2 = conc2.replace(' Year="0', ' Year="')
        conc2 = conc2.replace(' Extract="false"', '')
        conc2 = conc2.replace(' Delete="false"', '')
        conc2 = conc2.replace(' Hide="false"', '')
        conc2 = conc2.replace(' OldStyle="false"', '')
        conc2 = conc2.replace(' WritingMode="vertical"', '')
        conc2 = conc2.replace(' BorderTop="solid"', '')
        conc2 = conc2.replace(' BorderRight="solid"', '')
        conc2 = conc2.replace(' BorderBottom="solid"', '')
        conc2 = conc2.replace(' BorderLeft="solid"', '')
        conc2 = conc2.replace(' LineBreak="false"', '')

        if conc1 == conc2:
            return

        conc1 = conc1.replace(' Function="main"', '')

        conc2 = conc2.replace(' Function="main"', '')

        if conc1 == conc2:
            return

        conc1 = conc1.replace(' Num="1"', '')

        conc2 = conc2.replace(' Num="1"', '')

        if conc1 == conc2:
            return

        conc1 = re.sub(r' Num="[\d:_]+?"', '', conc1)

        conc2 = re.sub(r' Num="[\d:_]+?"', '', conc2)

        if conc1 == conc2:
            out_text = '\n'.join(lines).rstrip()
            print(f'''\
###
### [Num] mismatch
###

*** {filename1}
--- {filename2}
***************

{out_text}
''')
            return

        conc1 = conc1.replace(' Function="proviso"', '')

        conc2 = conc2.replace(' Function="proviso"', '')

        if conc1 == conc2:
            out_text = '\n'.join(lines).rstrip()
            print(f'''\
###
### [Function] mismatch
###

*** {filename1}
--- {filename2}
***************

{out_text}
''')
            return

        conc1 = conc1.replace(' Type="Amend"', '')

        conc2 = conc2.replace(' Type="Amend"', '')

        if conc1 == conc2:
            out_text = '\n'.join(lines).rstrip()
            print(f'''\
###
### [Type] mismatch
###

*** {filename1}
--- {filename2}
***************

{out_text}
''')
            return

        conc2 = re.sub(
            r'<AppdxTableTitle(?P<appdx_table_attr>[^>]*?)>(?P<appdx_table_text>.*)</AppdxTableTitle>.*?<RelatedArticleNum>(?P<related_article_num_text>.*)</RelatedArticleNum>',
            r'<AppdxTableTitle\g<appdx_table_attr>>\g<appdx_table_text>\g<related_article_num_text></AppdxTableTitle>',
            conc2,
            flags=re.DOTALL,
        )

        if conc1 == conc2:
            out_text = '\n'.join(lines).rstrip()
            print(f'''\
###
### <RelatedArticleNum> not in **reference**
###

*** {filename1}
--- {filename2}
***************

{out_text}
''')
            return

        conc1 = re.sub(r'</Column>\s*<Column[^>]*?>', '　', conc1)
        conc1 = re.sub(r'。</Sentence>\s*<Sentence[^>]*?>', '。', conc1)
        conc1 = re.sub(r'</Sentence>\s*<Sentence[^>]*?>', '　', conc1)

        conc2 = re.sub(r'</Column>\s*<Column[^>]*?>', '　', conc2)
        conc2 = re.sub(r'。</Sentence>\s*<Sentence[^>]*?>', '。', conc2)
        conc2 = re.sub(r'</Sentence>\s*<Sentence[^>]*?>', '　', conc2)

        if conc1 == conc2:
            out_text = '\n'.join(lines).rstrip()
            print(f'''\
###
### <Column>'s and/or <Sentence>'s mismatch
###

*** {filename1}
--- {filename2}
***************

{out_text}
''')
            return

        yield from lines

    def _filter_diff_lines(self, lines, law_num, type_, filename1='reference', filename2='output'):
        sub_lines = []
        lines_1 = []
        lines_2 = []
        state = 0
        for line in lines:
            line = line.rstrip()
            sub_lines.append(line)
            if state == 0:
                if line.startswith('***'):
                    state = 1
                    continue
            elif state == 1:
                if line.startswith('---'):
                    state = 2
                    continue
                lines_1.append(line)
            elif state == 2:
                if line.startswith('******'):
                    state = 0
                    if type_ == 'text':
                        yield from self._compare_text(lines_1, lines_2, sub_lines, law_num)
                    elif type_ == 'xml':
                        yield from self._compare_xml(lines_1, lines_2, sub_lines, law_num, filename1=filename1, filename2=filename2)
                    else:
                        raise Exception
                    sub_lines = []
                    lines_1 = []
                    lines_2 = []
                    continue
                lines_2.append(line)
        if sub_lines:
            state = 0
            if type_ == 'text':
                yield from self._compare_text(lines_1, lines_2, sub_lines, law_num)
            elif type_ == 'xml':
                yield from self._compare_xml(lines_1, lines_2, sub_lines, law_num, filename1=filename1, filename2=filename2)
            else:
                raise Exception
            sub_lines = []
            lines_1 = []
            lines_2 = []

    def _flatten_html(self, html_raw):
        import lxml.html
        html_el = lxml.html.fromstring(html_raw)
        html_law_el = html_el.find('.//div[@class="LawBody"]')
        html_text = ''.join(html_law_el.itertext())
        return html_text

    def _request(self, url):
        import requests
        response = requests.get(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
        })
        return response.text

    def _get_web_law(self, law_num):
        if law_num in _web_law_cache:
            return _web_law_cache[law_num]
        from urllib.parse import quote
        from xml.etree import ElementTree as ET
        from html import unescape
        from lawtext.util import xml_to_json

        xml_url = f'http://elaws.e-gov.go.jp/api/1/lawdata/{quote(law_num)}'

        xml_raw = self._request(xml_url)
        xml_el = ET.fromstring(xml_raw)
        xml_law_data_text = unescape(xml_el.find('.//LawFullText').text)

        law = xml_to_json(xml_law_data_text)

        _web_law_cache[law_num] = law

        return law

    def _get_reference_text(self, law_id):
        if law_id in _ref_text_cache:
            return _ref_text_cache[law_id]
        import lxml.html

        html_url = f'http://elaws.e-gov.go.jp/search/elawsSearch/elaws_search/lsg0500/viewContents?lawId={law_id}'

        html_raw = self._request(html_url)
        html_el = lxml.html.fromstring(html_raw)
        html_law_el = html_el.find('.//div[@class="LawBody"]')
        html_text = '\n'.join(html_law_el.itertext())

        _ref_text_cache[law_id] = html_text

        return html_text

    def _get_diff_out_text(self, lines1, lines2, law_num, type_, filename1='reference', filename2='output'):
        from difflib import context_diff
        lines = context_diff(lines1, lines2, n={'text': 0, 'xml': 1}[type_])
        lines = self._filter_diff_lines(lines, law_num, type_, filename1=filename1, filename2=filename2)

        out_text = '\n'.join(lines)
        return out_text.rstrip()

    def _fail_diff_out_text(self, law_name, law_num, out_text, filename1='reference', filename2='output'):
        self.fail(f'''\
Mismatching Output:
{law_name}
（{law_num}）

*** {filename1}
--- {filename2}
***************

{out_text}''')


class TestRender(AbstractTest):
    def test_render_htmlfragment_with_elaws(self):
        import lxml.html
        from lawtext.render import render_htmlfragment
        for law in self.LAWS:
            law_num, law_id, law_name = law['law_num'], law['law_id'], law['law_name']

            with self.subTest(**law):

                print(f'\nSubtest {law_name}（{law_num}）', file=sys.stderr)

                # print('  Downloading web XML ...', file=sys.stderr)
                xml_law_data_text = self._get_web_law(law_num)
                # print('  Rendering HTML fragment ...', file=sys.stderr)
                rendered_raw = render_htmlfragment(xml_law_data_text)

                # print('  Extracting text from HTML fragment ...', file=sys.stderr)
                rendered_el = lxml.html.fromstring(rendered_raw)
                rendered_text = '\n'.join(rendered_el.itertext())

                self.assertNotEqual(rendered_text, '')

                rendered_text = re.sub(
                    r'\[.+?\]',
                    '[別画面で表示]',
                    rendered_text,
                )

                print('  Comparing ...', file=sys.stderr)
                out_text = self._get_diff_out_text(
                    self._get_reference_text(law_id).split(),
                    rendered_text.split(),
                    law_num,
                    type_='text',
                )

                if out_text:
                    self._fail_diff_out_text(law_name, law_num, out_text)

    def test_render_html_with_elaws(self):
        import lxml.html
        from lawtext.render import render_html
        from pathlib import Path

        out_test_dir = Path('out_test_parse')

        for law in self.LAWS:
            law_num, law_id, law_name = law['law_num'], law['law_id'], law['law_name']

            with self.subTest(**law):

                print(f'\nSubtest {law_name}（{law_num}）', file=sys.stderr)

                # print('  Downloading web XML ...', file=sys.stderr)
                xml_law_data_text = self._get_web_law(law_num)
                # print('  Rendering HTML ...', file=sys.stderr)
                rendered_raw = render_html(xml_law_data_text)
                rendered_out_path = (out_test_dir / f'rendered_{law_name}.html').resolve()
                print(f'    Writing "{str(rendered_out_path)}" ...', file=sys.stderr)
                rendered_out_path.write_text(rendered_raw, encoding='utf-8')

                # print('  Extracting text from HTML ...', file=sys.stderr)
                rendered_el = lxml.html.fromstring(rendered_raw)
                rendered_body_el = rendered_el.find('.//body')
                rendered_text = '\n'.join(rendered_body_el.itertext())

                self.assertNotEqual(rendered_text, '')

                rendered_text = re.sub(
                    r'\[.+?\]',
                    '[別画面で表示]',
                    rendered_text,
                )

                print('  Comparing ...', file=sys.stderr)
                out_text = self._get_diff_out_text(
                    self._get_reference_text(law_id).split(),
                    rendered_text.split(),
                    law_num,
                    type_='text',
                )

                if out_text:
                    self._fail_diff_out_text(law_name, law_num, out_text)

    def test_render_docx_with_elaws(self):
        from lawtext.render import render_docx
        from zipfile import ZipFile
        import xml.etree.ElementTree as ET
        from pathlib import Path

        out_test_dir = Path('out_test_parse')

        for law in self.LAWS:
            law_num, law_id, law_name = law['law_num'], law['law_id'], law['law_name']

            with self.subTest(**law):

                print(f'\nSubtest {law_name}（{law_num}）', file=sys.stderr)

                # print('  Downloading web XML ...', file=sys.stderr)
                xml_law_data_text = self._get_web_law(law_num)
                # print('  Rendering docx ...', file=sys.stderr)
                rendered_docx = render_docx(xml_law_data_text)
                rendered_out_path = (out_test_dir / f'rendered_{law_name}.docx').resolve()
                print(f'    Writing "{str(rendered_out_path)}" ...', file=sys.stderr)
                rendered_out_path.write_bytes(rendered_docx)

                # print('  Extracting text from docx ...', file=sys.stderr)
                with io.BytesIO(rendered_docx) as f:
                    with ZipFile(f) as zip_:
                        rendered_document = zip_.read('word/document.xml').decode()
                rendered_document = re.sub(
                    r'<(?P<slash>/?)w:(?P<tag>\S+?)(?P<attr>[^>]*?)>',
                    r'<\g<slash>w_\g<tag>\g<attr>>',
                    rendered_document,
                )
                rendered_el = ET.fromstring(rendered_document)
                for ruby in rendered_el.findall('.//w_ruby'):
                    rt = ruby.find('w_rt')
                    ruby.remove(rt)
                    ruby.append(rt)
                rendered_texts = [
                    subtext
                    for el in rendered_el.findall('.//w_t')
                    for subtext in (el.text or '').split()
                ]
                rendered_text = '\n'.join(rendered_texts)
                rendered_text = re.sub(
                    r'（\s*(?P<body>\S+)\s*）',
                    r'（\g<body>）',
                    rendered_text,
                )
                def repl_tag(match):
                    return re.sub(
                        r'</?[^>]*?>',
                        '',
                        match.group(0),
                    )
                rendered_text = re.sub(
                    r'<QuoteStruct>.*?</QuoteStruct>',
                    repl_tag,
                    rendered_text,
                )
                rendered_text = re.sub(
                    r'\[.+?\]',
                    '[別画面で表示]',
                    rendered_text,
                )

                self.assertNotEqual(rendered_text, '')

                print('  Comparing ...', file=sys.stderr)
                out_text = self._get_diff_out_text(
                    self._get_reference_text(law_id).split(),
                    rendered_text.splitlines(),
                    law_num,
                    type_='text',
                )

                if out_text:
                    self._fail_diff_out_text(law_name, law_num, out_text)

    def test_render_lawtext_with_elaws(self):
        from lawtext.render import render_lawtext

        for law in self.LAWS:
            law_num, law_id, law_name = law['law_num'], law['law_id'], law['law_name']

            with self.subTest(**law):

                print(f'\nSubtest {law_name}（{law_num}）', file=sys.stderr)

                # print('  Downloading web XML ...', file=sys.stderr)
                xml_law_data_text = self._get_web_law(law_num)
                # print('  Rendering Lawtext ...', file=sys.stderr)
                rendered_text = render_lawtext(xml_law_data_text)

                # print('  Extracting text from Lawtext ...', file=sys.stderr)
                rendered_text = re.sub(
                    r'^\s*(?:\* )?- (?:\[\S+?\])*(.*)$',
                    r'\1',
                    rendered_text,
                    flags=re.M,
                )
                rendered_text = re.sub(
                    r'(?:</?Ruby>)|(?:</?Rt>)',
                    '',
                    rendered_text,
                    flags=re.M,
                )
                def repl_tag(match):
                    return re.sub(
                        r'</?[^>]*?>',
                        '',
                        match.group(0),
                    )
                rendered_text = re.sub(
                    r'<QuoteStruct>.*?</QuoteStruct>',
                    repl_tag,
                    rendered_text,
                )
                rendered_text = re.sub(
                    r'^\s*:\S*?:',
                    '',
                    rendered_text,
                    flags=re.M,
                )
                rendered_text = re.sub(
                    r'^(\s*)\.\.(?:\s*)figure::(?:\s*)(?:.+)$',
                    r'\1[別画面で表示]',
                    rendered_text,
                    flags=re.M,
                )

                self.assertNotEqual(rendered_text, '')

                print('  Comparing ...', file=sys.stderr)
                out_text = self._get_diff_out_text(
                    self._get_reference_text(law_id).split(),
                    rendered_text.split(),
                    law_num,
                    type_='text',
                )

                if out_text:
                    self._fail_diff_out_text(law_name, law_num, out_text)



class TestParse(AbstractTest):
    def test_parse_lawtext_with_elaws(self):
        from lawtext.render import render_lawtext, render_xml
        from lawtext.parse import parse_lawtext
        from lawtext.decorate import decorate
        from pathlib import Path
        from xml.dom import minidom

        out_test_dir = Path('out_test_parse')

        for law in self.LAWS:
            law_num, law_id, law_name = law['law_num'], law['law_id'], law['law_name']

            with self.subTest(**law):

                print(f'\nSubtest {law_name}（{law_num}）', file=sys.stderr)
                out_test_dir.mkdir(parents=True, exist_ok=True)

                # print('  Downloading web XML ...', file=sys.stderr)
                web_law = self._get_web_law(law_num)
                # print('  Parsing web XML ...', file=sys.stderr)
                web_xml = render_xml(web_law)
                web_outtext = minidom.parseString(web_xml).toprettyxml(indent='  ')
                web_out_path = (out_test_dir / f'web_{law_name}.xml').resolve()
                print(f'    Writing "{str(web_out_path)}" ...', file=sys.stderr)
                web_out_path.write_text(web_outtext, encoding='utf-8')

                # print('  Rendering lawtext ...', file=sys.stderr)
                lawtext = render_lawtext(web_law)
                rendered_out_path = (out_test_dir / f'rendered_{law_name}.law.txt').resolve()
                print(f'    Writing "{str(rendered_out_path)}" ...', file=sys.stderr)
                rendered_out_path.write_text(lawtext, encoding='utf-8')

                print('  Parsing lawtext ...', file=sys.stderr)

                t0 = time.time()
                parsed_law = parse_lawtext(lawtext)
                t1 = time.time()
                decorate(parsed_law)
                t2 = time.time()
                lines_count = len(lawtext.splitlines())

                print(f'    parse:    {(t1 - t0) * 1_000_000 / lines_count:3,.0f} μs/line  =  {(t1 - t0) * 1_000:5,.0f} ms / {lines_count:,} lines')
                print(f'    decorate: {(t2 - t1) * 1_000_000 / lines_count:3,.0f} μs/line  =  {(t2 - t1) * 1_000:5,.0f} ms / {lines_count:,} lines')

                parsed_xml = render_xml(parsed_law)
                parsed_outtext = minidom.parseString(parsed_xml).toprettyxml(indent="  ")
                parsed_out_path = (out_test_dir / f'parsed_{law_name}.xml').resolve()
                print(f'    Writing "{str(parsed_out_path)}" ...', file=sys.stderr)
                parsed_out_path.write_text(parsed_outtext, encoding='utf-8')

                print('  Comparing ...', file=sys.stderr)
                warning_outtext = None
                original_stdout = sys.stdout
                with io.StringIO() as buffer:
                    sys.stdout = buffer
                    out_text = self._get_diff_out_text(
                        web_outtext.splitlines(),
                        parsed_outtext.splitlines(),
                        law_num,
                        type_='xml',
                        filename1=str(web_out_path),
                        filename2=str(parsed_out_path),
                    )
                    warning_outtext = buffer.getvalue()
                    sys.stdout = original_stdout
                sys.stdout = original_stdout

                if warning_outtext:
                    warning_out_path = (out_test_dir / f'warning_{law_name}.diff').resolve()
                    print(f'    ###', file=sys.stderr)
                    print(f'    ### Some warning detected !!!', file=sys.stderr)
                    print(f'    ### Please see "{str(warning_out_path)}"', file=sys.stderr)
                    print(f'    ###', file=sys.stderr)
                    warning_out_path.write_text(warning_outtext, encoding='utf-8')

                if out_text:
                    self._fail_diff_out_text(
                        law_name, law_num, out_text,
                        filename1=str(web_out_path),
                        filename2=str(parsed_out_path),
                    )


class TestJSParse(AbstractTest):
    def test_js_parse_lawtext_with_elaws(self):
        from lawtext.render import render_lawtext, render_xml
        from lawtext.js.lawtext import parse as parse_lawtext
        from lawtext.decorate import decorate
        from pathlib import Path
        from xml.dom import minidom
        import subprocess
        import os

        os.environ["PATH"] += os.pathsep + str(Path(__file__).resolve().parents[1] / 'node_modules/.bin')


        for pegjs in (Path(__file__).parent.resolve() / 'js').glob('*.pegjs'):
            subprocess.check_call([
                'pegjs',
                '-o',
                str(pegjs.parent / f'{pegjs.stem}.js'),
                str(pegjs),
            ], shell=True)

        out_test_dir = Path('out_test_parse')

        for law in self.LAWS:
            law_num, law_id, law_name = law['law_num'], law['law_id'], law['law_name']

            with self.subTest(**law):

                print(f'\nSubtest {law_name}（{law_num}）', file=sys.stderr)
                out_test_dir.mkdir(parents=True, exist_ok=True)

                # print('  Downloading web XML ...', file=sys.stderr)
                web_law = self._get_web_law(law_num)
                # print('  Parsing web XML ...', file=sys.stderr)
                web_xml = render_xml(web_law)
                web_outtext = minidom.parseString(web_xml).toprettyxml(indent='  ')
                web_out_path = (out_test_dir / f'web_{law_name}.xml').resolve()
                print(f'    Writing "{str(web_out_path)}" ...', file=sys.stderr)
                web_out_path.write_text(web_outtext, encoding='utf-8')

                # print('  Rendering lawtext ...', file=sys.stderr)
                lawtext = render_lawtext(web_law)

                print('  Parsing lawtext ...', file=sys.stderr)

                t0 = time.time()
                parsed_law = parse_lawtext(lawtext)
                t1 = time.time()
                lines_count = len(lawtext.splitlines())

                print(f'    parse:    {(t1 - t0) * 1_000_000 / lines_count:3,.0f} μs/line  =  {(t1 - t0) * 1_000:5,.0f} ms / {lines_count:,} lines')

                parsed_xml = render_xml(parsed_law)
                parsed_outtext = minidom.parseString(parsed_xml).toprettyxml(indent="  ")
                parsed_out_path = (out_test_dir / f'js_parsed_{law_name}.xml').resolve()
                print(f'    Writing "{str(parsed_out_path)}" ...', file=sys.stderr)
                parsed_out_path.write_text(parsed_outtext, encoding='utf-8')

                print('  Comparing ...', file=sys.stderr)
                warning_outtext = None
                original_stdout = sys.stdout
                with io.StringIO() as buffer:
                    sys.stdout = buffer
                    out_text = self._get_diff_out_text(
                        web_outtext.splitlines(),
                        parsed_outtext.splitlines(),
                        law_num,
                        type_='xml',
                        filename1=str(web_out_path),
                        filename2=str(parsed_out_path),
                    )
                    warning_outtext = buffer.getvalue()
                    sys.stdout = original_stdout
                sys.stdout = original_stdout

                if warning_outtext:
                    warning_out_path = (out_test_dir / f'js_warning_{law_name}.diff').resolve()
                    print(f'    ###', file=sys.stderr)
                    print(f'    ### Some warning detected !!!', file=sys.stderr)
                    print(f'    ### Please see "{str(warning_out_path)}"', file=sys.stderr)
                    print(f'    ###', file=sys.stderr)
                    warning_out_path.write_text(warning_outtext, encoding='utf-8')

                if out_text:
                    self._fail_diff_out_text(
                        law_name, law_num, out_text,
                        filename1=str(web_out_path),
                        filename2=str(parsed_out_path),
                    )
