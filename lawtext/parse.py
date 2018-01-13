import re

DEFAULT_INDENT = '　'

class LawtextParseError(Exception):
    def __init__(self, message, lineno, lines):
        super().__init__(message)
        self.message = message
        self.lineno = lineno
        self.lines = lines
    def __str__(self):
        lines = [
            f'{ "==>" if lineno == self.lineno else "   " }{lineno:5}|{self.lines[lineno]}\n'
            for lineno in range(
                max(0, self.lineno - 2),
                min(len(self.lines), self.lineno + 2 + 1),
            )
        ]
        lines_str = ''.join(lines)
        return self.message + '\n\n' + lines_str

class LexerError(Exception):
    def __init__(self, message, lineno):
        super().__init__(message)
        self.message = message
        self.lineno = lineno

class LexerInternalError(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.message = message

class ParserError(Exception):
    def __init__(self, message, lineno):
        super().__init__(message)
        self.message = message
        self.lineno = lineno


re_DETECT_INDENT = re.compile(r'^(?P<indent>[ \t\f\v]+)\S.*$')

def detect_indent(lines):
    indents = set()
    for line in lines:
        match = re_DETECT_INDENT.match(line)
        if match:
            indents.add(match.group(1))

    if not len(indents):
        return DEFAULT_INDENT

    indents = sorted(indents, key=len)
    return indents[0]

def indent_level(indents, indent):
    s, n = re.subn(indent, '', indents)
    if s:
        indent_description = indent
        indent_description = re.sub(' ', '<半角スペース>', indent_description)
        indent_description = re.sub('　', '<全角スペース>', indent_description)
        indent_description = re.sub('	', '<tab>', indent_description)
        raise LexerInternalError(f'インデントの文字が整っていません。なお、この文書で用いられているインデント文字は、「{indent}」＝「{indent_description}」であると推測されました。')
    return n

re_TC1stLine   = re.compile(r'^(?P<indents>\s*)\* - ?(?P<tcbody>.*)$')
re_TCnthLine   = re.compile(r'^(?P<indents>\s*)  - ?(?P<tcbody>.*)$')
re_OptionLine   = re.compile(r'^(?P<indents>\s*):(?P<optname>\S+?):\s*(?P<optbody>.*)$')
re_FigLine   = re.compile(r'^(?P<indents>\s*)\.\.(?:\s+)figure::(?:\s+)(?P<figbody>.*)$')
re_DefaultLine = re.compile(r'^(?P<indents>\s*)(?P<linebody>\S.*)$')
re_BlankLine   = re.compile(r'^\s*$')

def lex_line(line, indent):

    match = re_TC1stLine.match(line)
    if match:
        return [
            'TC1stLine',
            indent_level(match.group(1), indent),
            lex_tcbody(match.group(2)),
        ]

    match = re_TCnthLine.match(line)
    if match:
        return [
            'TCnthLine',
            indent_level(match.group(1), indent),
            lex_tcbody(match.group(2)),
        ]

    match = re_OptionLine.match(line)
    if match:
        return [
            'OptionLine',
            indent_level(match.group(1), indent),
            {
                'name': match.group(2),
                'body': match.group(3),
            }
        ]

    match = re_FigLine.match(line)
    if match:
        return [
            'FigLine',
            indent_level(match.group(1), indent),
            {
                'body': match.group(2),
            }
        ]

    match = re_DefaultLine.match(line)
    if match:
        return [
            'DefaultLine',
            indent_level(match.group(1), indent),
            {
                'body': match.group(2),
            }
        ]

    match = re_BlankLine.match(line)
    if match:
        return [
            'BlankLine',
            0,
            {
                'body': '',
            }
        ]

    raise LexerInternalError('行の構造が判別できません。')

re_Arg = re.compile(r'^\[(?P<name>\S+?)="?(?P<value>\S+?)"?\]')

def lex_tcbody(tcbody):
    attr = {}
    body = tcbody
    while True:
        match = re_Arg.match(body)
        if not match:
            break
        attr[match.group(1)] = match.group(2)
        body = re_Arg.sub('', body, count=1)
    return {
        'attr': attr,
        'body': body,
    }

def lex(lines):
    indent = detect_indent(lines)
    ret = []
    for lineno, line in enumerate(lines):
        try:
            ret.append(lex_line(line, indent))
        except LexerInternalError as error:
            raise LexerError(error.message, lineno)

    return ret

PARENTHESIS_PAIRS = [
    (re.compile(r'[(（]'), re.compile(r'[)）]')),
    (re.compile(r'「'),    re.compile(r'」')),
]
re_FORCE_EXIT_PARENTHESIS = re.compile(r'」')
SENTENCE_DELIMITERS = [
    re.compile(r'。'),
]

def skip_parenthesis(text, pos):
    re_sp, re_ep = None, None
    for re_pair in PARENTHESIS_PAIRS:
        if re_pair[0].match(text[pos]):
            re_sp, re_ep = re_pair
            break
    if re_sp and re_ep:
        pos += 1
        while pos < len(text):
            old_pos = pos
            pos = skip_parenthesis(text, pos)
            if pos != old_pos:
                continue
            if re_ep.match(text[pos]):
                pos += 1
                break
            if re_FORCE_EXIT_PARENTHESIS.match(text[pos]):
                break
            pos += 1
    return pos

def split_sentences(text):
    sentences = []
    start_pos = 0
    pos = 0

    while pos < len(text):
        old_pos = pos
        pos = skip_parenthesis(text, pos)
        if pos != old_pos:
            continue
        for sentence_delimiter in SENTENCE_DELIMITERS:
            if sentence_delimiter.match(text[pos]):
                pos += 1
                sentences.append(text[start_pos:pos])
                start_pos = pos
                continue
        pos += 1
    if start_pos < len(text):
        sentences.append(text[start_pos:])

    return sentences

def split(text):
    split_text = []
    start_pos = 0
    pos = 0

    while pos < len(text):
        old_pos = pos
        pos = skip_parenthesis(text, pos)
        if pos != old_pos:
            continue
        if not text[pos].strip():
            split_text.append(text[start_pos:pos])
            pos += 1
            start_pos = pos
        pos += 1
    if start_pos < len(text):
        split_text.append(text[start_pos:])

    return split_text

def get_sentences(text):
    els = []
    text_split = split(text)

    if len(text_split) >= 2:
        for column in text_split:
            els.append({
                'tag': 'Column',
                'attr': {},
                'children': [{
                    'tag': 'Sentence',
                    'attr': {},
                    'children': [sentence],
                } for sentence in split_sentences(column)],
            })
    else:
        els.extend([{
            'tag': 'Sentence',
            'attr': {},
            'children': [sentence],
        } for sentence in split_sentences(text)])

    return els

re_LawNum            = re.compile(r'^[(（](?P<body>.+?)[）)](?:\s*)$')
re_ArticleRange      = re.compile(r'(?P<body>[(（].+?[）)])(?:\s*)$')
re_ArticleCaption    = re.compile(r'^[(（](?P<body>.+?)[）)](?:\s*)$')
re_ArticleBody       = re.compile(r'^(?P<title>\S+)\s+(?P<body>\S.*)(?:\s*)$')
re_ParagraphCaption  = re.compile(r'^[(（](?P<body>.+?)[）)](?:\s*)$')
re_ParagraphItemBody = re.compile(r'^(?P<title>\S+)\s+(?P<body>\S.*)(?:\s*)$')
re_SupplProvisionLabel = re.compile(r'^(?P<title>.+?)\s*(?:[(（](?P<amend_law_num>.+?)[）)])?(?:\s+(?P<extract>抄?))?(?:\s*)$')
re_AppdxTableLabel = re.compile(r'^(?P<title>.+?)\s*(?:(?P<related_article_num>[(（].+?[）)]))?(?:\s*)$')
re_AppdxStyleLabel = re.compile(r'^(?P<title>.+?)\s*(?:(?P<related_article_num>[(（].+?[）)]))?(?:\s*)$')

class Parser:
    def __init__(self, lexed_lines, lineno=0):
        self.lexed_lines = lexed_lines
        self.lineno = lineno
    def get(self, lineno):
        if 0 <= lineno < len(self.lexed_lines):
            return self.lexed_lines[lineno]
        else:
            return ('BlankLine', 0, {})
    def continuing(self):
        return self.lineno < len(self.lexed_lines)
    def forward(self):
        self.lineno += 1
    def here(self):
        return self.get(self.lineno)
    def prev(self):
        return self.get(self.lineno - 1)
    def next(self):
        return self.get(self.lineno + 1)



    def skip_blank_lines(self):
        while self.continuing():
            line_type, indent, data = self.here()
            if line_type == 'BlankLine':
                self.forward()
            else:
                break

    def process_title(self):
        self.skip_blank_lines()
        law_title = None
        law_num = None

        line_type, indent, data = self.here()
        next_line_type, next_indent, next_data = self.next()
        body_split = split(data['body'])

        if (
            line_type == 'DefaultLine' and
            indent == 0 and
            len(body_split) == 1 and
            (
                next_line_type == 'BlankLine' or

                # LawNum
                next_line_type == 'DefaultLine' and
                next_indent == 0
            )
        ):

            law_title = {
                'tag': 'LawTitle',
                'attr': {},
                'children': [data['body']],
            }
            self.forward()

            if self.continuing():
                line_type, indent, data = self.here()
                if line_type == 'DefaultLine':
                    match = re_LawNum.match(data['body'])
                    if not match:
                        ParserError('法令番号は括弧（　）で囲ってください。', lineno)
                    law_num = {
                        'tag': 'LawNum',
                        'attr': {},
                        'children': [match.group(1)],
                    }
                    self.forward()

        return law_title, law_num

    def process_enact_statement(self):
        self.skip_blank_lines()
        enact_statement = None

        line_type, indent, data = self.here()
        next_line_type, next_indent, next_data = self.next()
        body_split = split(data['body'])

        if (
            indent == 0 and
            len(body_split) == 1 and

            next_line_type == 'BlankLine'
        ):

            enact_statement = {
                'tag': 'EnactStatement',
                'attr': {},
                'children': [data['body']],
            }
            self.forward()

        return enact_statement


    def process_toc_group(self):
        self.skip_blank_lines()
        toc_group = None

        line_type, indent, data = self.here()
        next_line_type, next_indent, next_data = self.next()
        body_split = re.split(r'\s+', re.split('の', data['body'])[0])

        if (
            line_type == 'DefaultLine'
        ):

            toc_group_children = []

            toc_group_char = body_split[0][len(body_split[0]) - 1]

            title = re_ArticleRange.sub('', data['body'])
            title_tag = {
                '編': 'PartTitle', '章': 'ChapterTitle', '節': 'SectionTitle',
                '款': 'SubsectionTitle', '目': 'DivisionTitle', '条': 'ArticleTitle',
                '則': 'SupplProvisionLabel'
            }[toc_group_char]
            toc_group_children.append({
                'tag': title_tag,
                'attr': {},
                'children': [title],
            })

            match = re_ArticleRange.search(data['body'])
            if match:
                toc_group_children.append({
                    'tag': 'ArticleRange',
                    'attr': {},
                    'children': [match.group(1)],
                })

            self.forward()

            toc_base_indent = indent

            while self.continuing():
                line_type, indent, data = self.here()
                if line_type == 'DefaultLine':
                    if indent <= toc_base_indent:
                        break
                    elif indent != toc_base_indent + 1:
                        ParserError('目次の内容のインデントが整っていません。', lineno)
                    sub_toc_group = self.process_toc_group()
                    if sub_toc_group:
                        toc_group_children.append(sub_toc_group)
                    else:
                        break
                else:
                    break

            toc_tag = {
                '編': 'TOCPart', '章': 'TOCChapter', '節': 'TOCSection',
                '款': 'TOCSubsection', '目': 'TOCDivision', '条': 'TOCArticle',
                '則': 'TOCSupplProvision'
            }[toc_group_char]

            toc_group = {
                'tag': toc_tag,
                'attr': {},
                'children': toc_group_children,
            }

        return toc_group

    def process_toc(self):
        self.skip_blank_lines()
        toc = None

        line_type, indent, data = self.here()
        next_line_type, next_indent, next_data = self.next()
        body_split = split(data['body'])

        if (
            indent == 0 and
            len(body_split) == 1 and

            next_line_type == 'DefaultLine'
        ):
            toc_children = []
            toc_children.append({
                'tag': 'TOCLabel',
                'attr': {},
                'children': [data['body']],
            })
            self.forward()

            toc_base_indent = indent

            while self.continuing():
                line_type, indent, data = self.here()
                if line_type == 'DefaultLine':
                    if indent != toc_base_indent + 1:
                        ParserError('目次の内容のインデントが整っていません。', lineno)
                    toc_group = self.process_toc_group()
                    if toc_group:
                        toc_children.append(toc_group)
                    else:
                        break
                else:
                    break

            toc = {
                'tag': 'TOC',
                'attr': {},
                'children': toc_children,
            }

        return toc

    def process_main_provision(self):
        self.skip_blank_lines()
        main_provision = None
        main_provision_children = []

        while self.continuing():
            article_group = self.process_article_group()
            if article_group:
                main_provision_children.append(article_group)
            else:
                articles = self.process_articles()
                if len(articles):
                    main_provision_children.extend(articles)
                else:
                    break

        if len(main_provision_children):
            main_provision = {
                'tag': 'MainProvision',
                'attr': {},
                'children': main_provision_children,
            }

        return main_provision

    def process_article_group(self, parent_group_tag=''):
        self.skip_blank_lines()
        article_group = None

        line_type, indent, data = self.here()
        next_line_type, next_indent, next_data = self.next()
        body_split = re.split(r'\s+', re.split('の', data['body'])[0])
        article_group_char = body_split[0][len(body_split[0]) - 1]

        article_group_tag_rank = {
            '': 0, 'Part': 1, 'Chapter': 2, 'Section': 3,
            'Subsection': 4, 'Division': 5,
        }
        article_group_tags = {
            '編': 'Part', '章': 'Chapter', '節': 'Section',
            '款': 'Subsection', '目': 'Division',
        }

        if (
            indent != 0 and
            article_group_char in article_group_tags and
            article_group_tag_rank[article_group_tags[article_group_char]]
                > article_group_tag_rank[parent_group_tag] and

            next_line_type == 'BlankLine'
        ):
            article_group_tag = article_group_tags[article_group_char]
            article_group_title_tag = {
                '編': 'PartTitle', '章': 'ChapterTitle', '節': 'SectionTitle',
                '款': 'SubsectionTitle', '目': 'DivisionTitle', '条': 'ArticleTitle',
            }[article_group_char]

            article_group_children = []
            article_group_children.append({
                'tag': article_group_title_tag,
                'attr': {},
                'children': [data['body']],
            })
            self.forward()
            self.skip_blank_lines()

            while self.continuing():
                line_type, indent, data = self.here()

                sub_article_group = self.process_article_group(article_group_tag)
                if sub_article_group:
                    article_group_children.append(sub_article_group)
                else:
                    articles = self.process_articles()
                    if len(articles):
                        article_group_children.extend(articles)
                    else:
                        break

            if len(article_group_children):
                article_group = {
                    'tag': article_group_tag,
                    'attr': {},
                    'children': article_group_children,
                }

        return article_group

    def process_articles(self):
        self.skip_blank_lines()
        articles = []

        while self.continuing():
            article = self.process_article()
            if article:
                articles.append(article)
            else:
                break

        return articles

    def process_article(self):
        self.skip_blank_lines()
        article = None
        article_children = []

        line_type, indent, data = self.here()
        body_split = split(data['body']) if len(data) else ''
        next_line_type, next_indent, next_data = self.next()
        next_body_split = split(next_data['body']) if len(next_data) else ''
        next2_line_type, next2_indent, next2_data = self.get(self.lineno + 2)

        if (
            line_type == 'DefaultLine' and
            indent == 1 and
            re_ArticleCaption.match(data['body']) and

            next_line_type == 'DefaultLine' and
            next_indent == 0 and
            not (next2_data['body'].startswith('別表') if len(next2_data) else False) and
            (
                re_ArticleBody.match(next_data['body']) or
                (
                    # No Body
                    len(next_body_split) == 1 and
                    next2_line_type == 'DefaultLine' and
                    next2_indent == 0 and
                    re_ParagraphItemBody.match(next2_data['body'])
                )
            )

        ):
            article_children.append({
                'tag': 'ArticleCaption',
                'attr': {},
                'children': [data['body']],
            })
            self.forward()
            # No skip blank line

            line_type, indent, data = self.here()
            body_split = split(data['body']) if len(data) else ''
            next_line_type, next_indent, next_data = self.next()

        match = re_ArticleBody.match(data['body'])
        if (
            line_type == 'DefaultLine' and
            indent == 0 and
            not data['body'].startswith('別表') and
            (
                match or
                (
                    # No Body
                    len(body_split) == 1 and
                    next_line_type == 'DefaultLine' and
                    next_indent == 0 and
                    re_ParagraphItemBody.match(next_data['body'])
                )
            )
        ):
            if match:
                article_title, _ = match.group(1), match.group(2)
            else:
                article_title = data['body']

            article_children.append({
                'tag': 'ArticleTitle',
                'attr': {},
                'children': [article_title],
            })

            first_paragraph_in_article = True

            if not match:
                article_children.append({
                    'tag': 'Paragraph',
                    'attr': {},
                    'children': [
                        {
                            'tag': 'ParagraphNum',
                            'attr': {},
                            'children': [],
                        },
                        {
                            'tag': 'ParagraphSentence',
                            'attr': {},
                            'children': [{
                                'tag': 'Sentence',
                                'attr': {},
                                'children': [],
                            }],
                        },
                    ],
                })
                self.forward()
                first_paragraph_in_article = False

            paragraph_items = self.process_paragraph_items(indent, first_paragraph_in_article)
            if len(paragraph_items):
                article_children.extend(paragraph_items)

            article = {
                'tag': 'Article',
                'attr': {},
                'children': article_children,
            }

        return article

    def process_paragraph_items(self, current_indent=0, in_article=False):
        self.skip_blank_lines()
        paragraph_items = []

        first_paragraph_in_article = in_article

        while self.continuing():
            paragraph_item = self.process_paragraph_item(current_indent,  first_paragraph_in_article)
            if paragraph_item:
                paragraph_items.append(paragraph_item)
                first_paragraph_in_article = False
            else:
                break

        return paragraph_items

    def process_paragraph_item(self, current_indent, first_paragraph_in_article=False):
        self.skip_blank_lines()
        paragraph_item = None
        paragraph_item_children = []

        line_type, indent, data = self.here()
        next_line_type, next_indent, next_data = self.next()
        next_match = re_ParagraphItemBody.match(next_data['body']) if len(next_data) else None

        if (
            not first_paragraph_in_article and

            line_type == 'DefaultLine' and
            indent == current_indent + 1 and
            re_ParagraphCaption.match(data['body']) and

            next_line_type == 'DefaultLine' and
            next_indent == current_indent and
            next_match and
            '条' not in next_match.group(1) and
            '附' not in next_match.group(1) and
            '付' not in next_match.group(1) and
            not next_match.group(1).startswith('別表')
        ):
            paragraph_item_children.append({
                'tag': 'ParagraphCaption',
                'attr': {},
                'children': [data['body']],
            })
            self.forward()
            # No skip blank line

            line_type, indent, data = self.here()
            next_line_type, next_indent, next_data = self.next()

        paragraph_item_tags = {
             0: 'Paragraph', 1: 'Item',
             2: 'Subitem1',  3: 'Subitem2',  4: 'Subitem3',
             5: 'Subitem4',  6: 'Subitem5',  7: 'Subitem6',
             8: 'Subitem7',  9: 'Subitem8', 10: 'Subitem9',
            11: 'Subitem10',
        }
        paragraph_item_title_tags = {
             0: 'ParagraphNum',  1: 'ItemTitle',
             2: 'Subitem1Title', 3: 'Subitem2Title', 4: 'Subitem3Title',
             5: 'Subitem4Title', 6: 'Subitem5Title', 7: 'Subitem6Title',
             8: 'Subitem7Title', 9: 'Subitem8Title', 10: 'Subitem9Title',
            11: 'Subitem10Title',
        }
        paragraph_item_sentence_tags = {
             0: 'ParagraphSentence',  1: 'ItemSentence',
             2: 'Subitem1Sentence', 3: 'Subitem2Sentence', 4: 'Subitem3Sentence',
             5: 'Subitem4Sentence', 6: 'Subitem5Sentence', 7: 'Subitem6Sentence',
             8: 'Subitem7Sentence', 9: 'Subitem8Sentence', 10: 'Subitem9Sentence',
            11: 'Subitem10Sentence',
        }

        match = re_ParagraphItemBody.match(data['body'])
        if (
            line_type == 'DefaultLine' and
            indent == current_indent and
            (
                (
                    match and
                    '附' not in match.group(1) and
                    '付' not in match.group(1) and
                    '備考' not in match.group(1) and
                    (
                        first_paragraph_in_article or
                        (
                            '条' not in match.group(1) and
                            not match.group(1).startswith('別表')
                        )
                    )
                ) or
                (
                    indent == 0 and
                    len(split(data['body'])) == 1 and
                    not data['body'].startswith('別表')
                )
            )
        ):

            if first_paragraph_in_article or not match:
                paragraph_item_children.append({
                    'tag': 'ParagraphNum',
                    'attr': {},
                    'children': [],
                })
            else:
                paragraph_item_title = match.group(1)
                paragraph_item_title_tag = paragraph_item_title_tags[current_indent]
                paragraph_item_children.append({
                    'tag': paragraph_item_title_tag,
                    'attr': {},
                    'children': [paragraph_item_title],
                })
            paragraph_item_sentence_children = get_sentences(match.group(2) if match else data['body'])
            paragraph_item_sentence_tag = paragraph_item_sentence_tags[current_indent]
            paragraph_item_children.append({
                'tag': paragraph_item_sentence_tag,
                'attr': {},
                'children': paragraph_item_sentence_children,
            })
            self.forward()

            table_struct = self.process_table_struct(current_indent + 1)
            if table_struct:
                paragraph_item_children.append(table_struct)

            paragraph_item_tag = paragraph_item_tags[current_indent]
            sub_paragraph_items = self.process_paragraph_items(current_indent + 1)
            if len(sub_paragraph_items):
                paragraph_item_children.extend(sub_paragraph_items)

            table_struct = self.process_table_struct(current_indent + 1)
            if table_struct:
                paragraph_item_children.append(table_struct)

            while self.continuing():
                list_ = self.process_list(current_indent + 2)
                if list_:
                    paragraph_item_children.append(list_)
                else:
                    break

            paragraph_item = {
                'tag': paragraph_item_tag,
                'attr': {},
                'children': paragraph_item_children,
            }

        return paragraph_item

    def process_table_struct(self, current_indent):
        self.skip_blank_lines()
        table_struct = None
        table_children = []
        table_struct_children = []

        remarks = self.process_remarks(current_indent)
        if remarks:
            table_struct_children.append(remarks)

        options = {}

        while self.continuing():
            option = self.process_option(current_indent)
            if option:
                options[option[0]] = option[1]
            else:
                break

        table_struct_title = options.get('table-struct-title')
        if table_struct_title:
            table_struct_children.append({
                'tag': 'TableStructTitle',
                'attr': {},
                'children': table_struct_title,
            })

        table = self.process_table(current_indent)
        if table:
            table_struct_children.append(table)

        remarks = self.process_remarks(current_indent)
        if remarks:
            table_struct_children.append(remarks)

        if len(table_struct_children):
            table_struct = {
                'tag': 'TableStruct',
                'attr': {},
                'children': table_struct_children,
            }

        return table_struct

    def process_table(self, current_indent):
        table = None

        line_type, indent, data = self.here()

        if (
            line_type == 'TC1stLine' and
            indent == current_indent
        ):
            table_rows = self.process_table_rows(current_indent)
            if len(table_rows):
                table = {
                    'tag': 'Table',
                    'attr': {},
                    'children': table_rows,
                }

        return table

    def process_table_rows(self, current_indent):
        table_rows = []

        while self.continuing():
            table_row = self.process_table_row(current_indent)
            if table_row:
                table_rows.append(table_row)
            else:
                break

        return table_rows

    def process_table_row(self, current_indent):
        self.skip_blank_lines()
        table_row = None
        table_row_children = []

        line_type, indent, data = self.here()
        next_line_type, next_indent, next_data = self.next()

        if (
            line_type == 'TC1stLine' and
            indent == current_indent
        ):
            table_columns = self.process_table_columns(current_indent)
            if len(table_columns):
                table_row_children.extend(table_columns)
                table_row = {
                    'tag': 'TableRow',
                    'attr': {},
                    'children': table_row_children,
                }

        return table_row

    def process_table_columns(self, current_indent):
        table_columns = []

        first_column_processed = False

        while self.continuing():
            line_type, indent, data = self.here()
            if (
                (
                    not first_column_processed and
                    line_type == 'TC1stLine'
                ) or (
                    first_column_processed and
                    line_type == 'TCnthLine'
                )
            ):
                table_column = self.process_table_column(current_indent)
                if table_column:
                    table_columns.append(table_column)
                    if not first_column_processed:
                        first_column_processed = True
                else:
                    break
            else:
                break

        return table_columns

    def process_table_column(self, current_indent):
        self.skip_blank_lines()
        table_column = None
        table_column_children = []

        line_type, indent, data = self.here()
        next_line_type, next_indent, next_data = self.next()

        if (
            line_type in ('TC1stLine', 'TCnthLine') and
            indent == current_indent
        ):
            table_column_children.append({
                'tag': 'Sentence',
                'attr': {},
                'children': [data['body']],
            })
            self.forward()

            table_column_attr = data.get('attr', {})

            table_column_base_indent = indent

            while self.continuing():
                line_type, indent, data = self.here()
                next_line_type, next_indent, next_data = self.next()

                if (
                    line_type == 'DefaultLine' and
                    indent == current_indent + 2
                ):
                    table_column_children.append({
                        'tag': 'Sentence',
                        'attr': {},
                        'children': [data['body']],
                    })
                    self.forward()
                else:
                    break

            table_column = {
                'tag': 'TableColumn',
                'attr': table_column_attr,
                'children': table_column_children,
            }

        return table_column

    def process_fig(self, current_indent):
        self.skip_blank_lines()
        fig = None

        line_type, indent, data = self.here()

        if (
            line_type == 'FigLine' and
            indent == current_indent
        ):
            fig = {
                'tag': 'Fig',
                'attr': {
                    'src': data['body'],
                },
                'children': [],
            }
            self.forward()

        return fig

    def process_list(self, current_indent):
        self.skip_blank_lines()
        list_ = None
        list_children = []

        line_type, indent, data = self.here()
        next_line_type, next_indent, next_data = self.next()
        body_split = split(data['body']) if len(data) else ['']

        if (
            line_type == 'DefaultLine' and
            indent == current_indent and
            body_split[0][len(body_split[0]) - 1] not in ('編', '章', '節', '款', '目', '条', '附', '付', '則')
        ):
            list_ = {
                'tag': 'List',
                'attr': {},
                'children': [{
                    'tag': 'ListSentence',
                    'attr': {},
                    'children': get_sentences(data['body']),
                }],
            }
            self.forward()

        return list_

    def process_option(self, current_indent):
        self.skip_blank_lines()

        line_type, indent, data = self.here()
        option = None

        if (
            line_type == 'OptionLine' and
            indent == current_indent
        ):
            option = data['name'], data['body']
            self.forward()

        return option

    def process_suppl_provision(self):
        self.skip_blank_lines()
        suppl_provision = None
        suppl_provision_children = []

        line_type, indent, data = self.here()
        next_line_type, next_indent, next_data = self.next()
        match = re_SupplProvisionLabel.match(data['body'])
        titlejoin = re.sub(r'\s+', '', match.group(1)) if match else ''

        if (
            line_type == 'DefaultLine' and
            indent != 0 and
            match and
            (
                titlejoin.startswith('付則') or
                titlejoin.startswith('附則')
            )
        ):
            suppl_provision_attr = {}
            if match.group(3):
                suppl_provision_attr['Extract'] = 'true'
            if match.group(2):
                suppl_provision_attr['AmendLawNum'] = match.group(2)
            suppl_provision_children.append({
                'tag': 'SupplProvisionLabel',
                'attr': {},
                'children': [match.group(1)],
            })
            self.forward()

            articles_or_paragraph_items_processed = False

            while self.continuing():
                paragraph_items = self.process_paragraph_items()
                if len(paragraph_items):
                    suppl_provision_children.extend(paragraph_items)
                    articles_or_paragraph_items_processed = True
                else:
                    articles = self.process_articles()
                    if len(articles):
                        suppl_provision_children.extend(articles)
                        articles_or_paragraph_items_processed = True
                    else:
                        break

            line_type, indent, data = self.here()
            if (
                not articles_or_paragraph_items_processed and
                line_type == 'DefaultLine' and
                indent == 0
            ):

                suppl_provision_children.append({
                    'tag': 'Paragraph',
                    'attr': {},
                    'children': [
                        {
                            'tag': 'ParagraphNum',
                            'attr': {},
                            'children': [],
                        },
                        {
                            'tag': 'ParagraphSentence',
                            'attr': {},
                            'children': get_sentences(data['body']),
                        },
                    ],
                })
                self.forward()

            if len(suppl_provision_children):
                suppl_provision = {
                    'tag': 'SupplProvision',
                    'attr': suppl_provision_attr,
                    'children': suppl_provision_children,
                }

        return suppl_provision

    def process_appdx_table(self):
        self.skip_blank_lines()
        appdx_table = None
        appdx_table_children = []

        line_type, indent, data = self.here()
        next_line_type, next_indent, next_data = self.next()
        match = re_AppdxTableLabel.match(data['body'])
        titlejoin = re.sub(r'\s+', '', match.group(1)) if match else ''

        if (
            line_type == 'DefaultLine' and
            indent == 0 and
            match and
            titlejoin.startswith('別表')
        ):
            appdx_table_children.append({
                'tag': 'AppdxTableTitle',
                'attr': {},
                'children': [match.group(1)],
            })
            if match.group(2):
                appdx_table_children.append({
                    'tag': 'RelatedArticleNum',
                    'attr': {},
                    'children': [match.group(2)],
                })
            self.forward()

            current_indent = indent

            paragraph_items = self.process_paragraph_items(current_indent + 1)
            if len(paragraph_items):
                appdx_table_children.extend(paragraph_items)

            table_struct = self.process_table_struct(current_indent + 1)
            if table_struct:
                appdx_table_children.append(table_struct)

            appdx_table = {
                'tag': 'AppdxTable',
                'attr': {},
                'children': appdx_table_children,
            }

        return appdx_table

    def process_appdx_style(self):
        self.skip_blank_lines()
        appdx_style = None
        appdx_style_children = []
        style_struct_children = []

        line_type, indent, data = self.here()
        match = re_AppdxStyleLabel.match(data['body'])
        body_split = re.split(r'\s+', data['body'], maxsplit=1) if len(data) else ['']

        if (
            line_type == 'DefaultLine' and
            indent == 0 and
            body_split[0].startswith('様式')
        ):
            appdx_style_children.append({
                'tag': 'AppdxStyleTitle',
                'attr': {},
                'children': [match.group(1)],
            })
            if match.group(2):
                appdx_style_children.append({
                    'tag': 'RelatedArticleNum',
                    'attr': {},
                    'children': [match.group(2)],
                })
            self.forward()

            current_indent = indent

            while self.continuing():
                style_struct = self.process_style_struct(current_indent + 1)
                if style_struct:
                    appdx_style_children.append(style_struct)
                else:
                    break

            appdx_style = {
                'tag': 'AppdxStyle',
                'attr': {},
                'children': appdx_style_children,
            }

        return appdx_style

    def process_style_struct(self, current_indent):
        self.skip_blank_lines()
        style_struct = None
        style_struct_children = []

        remarks = self.process_remarks(current_indent)
        if remarks:
            style_struct_children.append(remarks)

        options = {}

        while self.continuing():
            option = self.process_option(current_indent)
            if option:
                options[option[0]] = option[1]
            else:
                break

        style_struct_title = options.get('style-struct-title')
        if style_struct_title:
            style_struct_children.append({
                'tag': 'StyleStructTitle',
                'attr': {},
                'children': style_struct_title,
            })

        line_type, indent, data = self.here()
        next_line_type, next_indent, next_data = self.next()

        fig = self.process_fig(current_indent)
        if fig:
            style = {
                'tag': 'Style',
                'attr': {},
                'children': [fig],
            }
            style_struct_children.append(style)

        table = self.process_table(current_indent)
        if table:
            style = {
                'tag': 'Style',
                'attr': {},
                'children': [table],
            }
            style_struct_children.append(style)

        remarks = self.process_remarks(current_indent)
        if remarks:
            style_struct_children.append(remarks)

        if len(style_struct_children):
            style_struct = {
                'tag': 'StyleStruct',
                'attr': {},
                'children': style_struct_children,
            }

        return style_struct

    def process_remarks(self, current_indent):
        self.skip_blank_lines()
        remarks = None
        remarks_children = []

        line_type, indent, data = self.here()
        body_split = re.split(r'\s+', data['body'], maxsplit=1) if len(data) else ['']

        if (
            line_type == 'DefaultLine' and
            indent == current_indent and (
                body_split[0].startswith('備考') or
                body_split[0].startswith('注')
            )
        ):
            remarks_children.append({
                'tag': 'RemarksLabel',
                'attr': {},
                'children': [body_split[0]],
            })

            if len(body_split) > 1:
                remarks_children.extend(get_sentences(body_split[1]))

            self.forward()

            paragraph_items = self.process_paragraph_items(current_indent + 1)
            if len(paragraph_items):
                remarks_children.extend(paragraph_items)

            while self.continuing():
                line_type, indent, data = self.here()
                next_line_type, next_indent, next_data = self.next()

                if (
                    line_type == 'DefaultLine' and
                    indent == current_indent + 2
                ):
                    remarks_children.append({
                        'tag': 'Sentence',
                        'attr': {},
                        'children': [data['body']],
                    })
                    self.forward()
                else:
                    break

            remarks = {
                'tag': 'Remarks',
                'attr': {},
                'children': remarks_children,
            }

        return remarks

    def process_law(self):
        self.skip_blank_lines()
        law_children = []
        law_body_children = []
        law_num = None

        law_title, law_num = self.process_title()
        if law_num:
            law_children.append(law_num)
        if law_title:
            law_body_children.append(law_title)

        while self.continuing():
            enact_statement = self.process_enact_statement()
            if enact_statement:
                law_body_children.append(enact_statement)
                continue
            break

        toc = self.process_toc()
        if toc:
            law_body_children.append(toc)

        main_provision = self.process_main_provision()
        if main_provision:
            law_body_children.append(main_provision)

        while self.continuing():
            suppl_provision = self.process_suppl_provision()
            if suppl_provision:
                law_body_children.append(suppl_provision)
                continue
            appdx_table = self.process_appdx_table()
            if appdx_table:
                law_body_children.append(appdx_table)
                continue
            appdx_style = self.process_appdx_style()
            if appdx_style:
                law_body_children.append(appdx_style)
                continue
            break

        law_children.append({
            'tag': 'LawBody',
            'attr': {},
            'children': law_body_children,
        })

        return {
            'tag': 'Law',
            'attr': {},
            'children': law_children,
        }

def parse_lawtext(lawtext):
    lines = re.split(r'\r\n', lawtext)
    if len(lines) <= 1:
        lines = re.split(r'\n', lawtext)

    try:
        lexed_lines = lex(lines)
    except LexerError as error:
        lineno = error.lineno
        raise LawtextParseError(error.message, lineno, lines)

    parser = Parser(lexed_lines)

    try:
        law = parser.process_law()
    except ParserError as error:
        lineno = error.lineno
        raise LawtextParseError(error.message, lineno, lines)
    except LawtextParseError as e:
        raise e
    except Exception as e:
        raise LawtextParseError('この行の処理中にエラーが発生しました。', parser.lineno, lines)

    if parser.continuing():
        lineno = parser.lineno
        raise LawtextParseError('この行の種類が判別できません。', lineno, lines)

    return law
