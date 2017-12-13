import re
# import unicodedata

re_JpNum = re.compile(r'^(?P<s1000>(?P<d1000>\S*)千)?(?P<s100>(?P<d100>\S*)百)?(?P<s10>(?P<d10>\S*)十)?(?P<d1>\S*)?$')
jpnum_digits = {
    '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
    '六': 6, '七': 7, '八': 8, '九': 9,
}

def parse_jpnum(text):
    match = re_JpNum.match(text)
    if match:
        d1000 = jpnum_digits.get(match.group(2), 1 if match.group(1) else 0)
        d100  = jpnum_digits.get(match.group(4), 1 if match.group(3) else 0)
        d10   = jpnum_digits.get(match.group(6), 1 if match.group(5) else 0)
        d1    = jpnum_digits.get(match.group(7), 0)
        return str(d1000 * 1000 + d100 * 100 + d10 * 10 + d1)
    return None

def parse_romannum(text):
    num = 0
    for i, char in enumerate(text):
        if char in ('i', 'I', 'ｉ', 'Ｉ'):
            if (
                i + 1 < len(text) and
                text[i + 1] in ('x', 'X', 'ｘ', 'Ｘ')
            ):
                num -= 1
            else:
                num += 1
        if char in ('x', 'X', 'ｘ', 'Ｘ'):
            num += 10
    return num

eras = {
    '明治': 'Meiji', '大正': 'Taisho',
    '昭和': 'Showa', '平成': 'Heisei',
}

re_LawTypes = [
    (re.compile(r'^法律$'), 'Act'),
    (re.compile(r'^政令$'), 'CabinetOrder'),
    (re.compile(r'^勅令$'), 'ImperialOrder'),
    (re.compile(r'^\S*[^政勅]令$'), 'MinisterialOrdinance'),
    (re.compile(r'^\S*規則$'), 'Rule'),
]

re_LawNum = re.compile(r'(?P<era>\S+?)(?P<year>[一二三四五六七八九十]+)年(?P<law_type>\S+?)第(?P<num>[一二三四五六七八九十百千]+)号')

def decorate_law(el):
    el['attr']['Lang'] = 'ja'
    for subel in el['children']:
        if (
            subel['tag'] == 'LawNum' and
            len(subel['children'])
        ):
            law_num = subel['children'][0]
            match = re_LawNum.match(law_num)
            if match:
                era = eras.get(match.group(1))
                if era:
                    el['attr']['Era'] = era

                year = parse_jpnum(match.group(2))
                if year:
                    el['attr']['Year'] = str(year)

                for re_LawType, law_type in re_LawTypes:
                    law_type_match = re_LawType.match(match.group(3))
                    if law_type_match:
                        el['attr']['LawType'] = law_type
                        break

                num = parse_jpnum(match.group(4))
                if num:
                    el['attr']['Num'] = num

WIDE_NUMS = {
    '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
    '５': '5', '６': '6', '７': '7', '８': '8', '９': '9',
}

def replace_wide_num(text):
    ret = text
    for wide, narrow in WIDE_NUMS.items():
        ret = ret.replace(wide, narrow)
    return ret

re_NamedNum = re.compile(r'^(?P<circle>○?)第?(?P<num>[一二三四五六七八九十百千]+)\S*?(?P<branch>の\S+)?$')
IROHA_CHARS = 'イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセスン'
re_ItemNum = re.compile(r'^\D*(?P<num>\d+)\D*$')

def parse_named_num(text):
    nums_group = []

    for subtext in text.replace('及び', '、').replace('から', '、').replace('まで', '').replace('～', '、').replace('・', '、').split('、'):

        match = re_NamedNum.match(subtext)
        if match:
            nums = [parse_jpnum(match.group(2))]
            if match.group(3):
                nums.extend([
                    parse_jpnum(b)
                    for b in match.group(3).split('の')
                    if b
                ])
            nums_group.append('_'.join(map(str, nums)))
            continue

        iroha_char_detected = False

        for i, char in enumerate(IROHA_CHARS):
            if char in subtext:
                nums_group.append(str(i + 1))
                iroha_char_detected = True
                break

        if not iroha_char_detected:
            subtext = replace_wide_num(subtext)
            match = re_ItemNum.match(subtext)
            if match:
                nums_group.append(match.group(1))
                continue

        roman_num = parse_romannum(subtext)
        if roman_num:
            nums_group.append(str(roman_num))

    return ':'.join(nums_group)

# re_ParagraphNum = re.compile(r'^(?P<circle>○?)(?P<num>\d+)$')

# def parse_paragraph_num(text):
#     text = unicodedata.normalize('NFKC', text)
#     match = re_ParagraphNum.match(text)
#     if match:
#         return match.group('circle'), int(match.group('num'))


# def parse_item_num(text):
#     num = parse_named_num(text)
#     if num:
#         return num
#     for i, char in enumerate(IROHA_CHARS):
#         if char in text:
#             return i + 1
#     text = unicodedata.normalize('NFKC', text)
#     match = re_ItemNum.match(text)
#     if match:
#         return int(match.group('num'))

def decorate_toc_article_group(el):
    el['attr']['Delete'] = 'false'
    for subel in el['children']:
        if (
            subel['tag'] in (
                'PartTitle', 'ChapterTitle', 'SectionTitle',
                'SubsectionTitle', 'DivisionTitle', 'ArticleTitle',
            ) and
            len(subel['children'])
        ):
            body = subel['children'][0]
            num = parse_named_num(body.split()[0])
            if num:
                el['attr']['Num'] = num

def decorate_article_group(el):
    el['attr']['Delete'] = 'false'
    el['attr']['Hide'] = 'false'
    for subel in el['children']:
        if (
            subel['tag'] in (
                'PartTitle', 'ChapterTitle', 'SectionTitle',
                'SubsectionTitle', 'DivisionTitle', 'ArticleTitle',
            ) and
            len(subel['children'])
        ):
            body = subel['children'][0]
            num = parse_named_num(body.split()[0])
            if num:
                el['attr']['Num'] = num

def decorate_article(el):
    el['attr']['Delete'] = 'false'
    el['attr']['Hide'] = 'false'
    for subel in el['children']:
        if (
            subel['tag'] == 'ArticleTitle' and
            len(subel['children'])
        ):
            body = subel['children'][0]
            num = parse_named_num(body.split()[0])
            if num:
                el['attr']['Num'] = num

def decorate_paragraph(el):
    el['attr']['Hide'] = 'false'
    el['attr']['OldStyle'] = 'false'
    for subel in el['children']:
        if (
            subel['tag'] == 'ParagraphNum'
        ):
            if len(subel['children']):
                paragraph_num = subel['children'][0]
                num = parse_named_num(paragraph_num)
            else:
                num = '1'
            if num:
                el['attr']['Num'] = num

def decorate_item(el):
    el['attr']['Delete'] = 'false'
    el['attr']['Hide'] = 'false'
    for subel in el['children']:
        if (
            subel['tag'] in (
                'ItemTitle',
                'Subitem1Title', 'Subitem2Title', 'Subitem3Title',
                'Subitem4Title', 'Subitem5Title', 'Subitem6Title',
                'Subitem7Title', 'Subitem8Title', 'Subitem9Title',
                'Subitem10Title',
            )
        ):
            body = subel['children'][0]
            num = parse_named_num(body.split()[0])
            if num:
                el['attr']['Num'] = num

def decorate_column_sentence_group(el):
    column_sentences = []
    for subel in el['children']:
        if (
            subel['tag'] in ('Column', 'Sentence')
        ):
            column_sentences.append(subel)

    proviso_nums = []
    for i, subel in enumerate(column_sentences):
        if(len(column_sentences) > 1):
            subel['attr']['Num'] = str(i + 1)
        if (
            subel['tag'] == 'Column'
        ):
            subel['attr']['LineBreak'] = 'false'
        if (
            subel['tag'] == 'Sentence' and
            len(subel['children']) and
            (
                subel['children'][0].startswith('ただし、') or
                subel['children'][0].startswith('但し、')
            )
        ):
            proviso_nums.append(i)

    if len(proviso_nums):
        for i, subel in enumerate(column_sentences):
            subel['attr']['Function'] = 'proviso' if i in proviso_nums else 'main'

def decorate_sentence(el):
    el['attr']['WritingMode'] = 'vertical'

def decorate_table(el):
    el['attr']['WritingMode'] = 'vertical'

def decorate_table_column(el):
    el['attr']['BorderTop'] = 'solid'
    el['attr']['BorderRight'] = 'solid'
    el['attr']['BorderBottom'] = 'solid'
    el['attr']['BorderLeft'] = 'solid'

def appdx_table_title(el):
    el['attr']['WritingMode'] = 'vertical'

def decorate(el):

    if el['tag'] == 'Law':
        decorate_law(el)

    elif el['tag'] in (
        'TOCPart', 'TOCChapter', 'TOCSection',
        'TOCSubsection', 'TOCDivision', 'TOCArticle',
    ):
        decorate_toc_article_group(el)

    elif el['tag'] in (
        'Part', 'Chapter', 'Section',
        'Subsection', 'Division',
    ):
        decorate_article_group(el)

    elif el['tag'] == 'Article':
        decorate_article(el)

    elif el['tag'] == 'Paragraph':
        decorate_paragraph(el)

    elif el['tag'] == 'Sentence':
        decorate_sentence(el)

    elif el['tag'] in (
        'Item',
        'Subitem1', 'Subitem2', 'Subitem3', 'Subitem4', 'Subitem5',
        'Subitem6', 'Subitem7', 'Subitem8', 'Subitem9', 'Subitem10',
    ):
        decorate_item(el)

    elif el['tag'] in (
        'ParagraphSentence', 'ItemSentence',
        'Subitem1Sentence', 'Subitem2Sentence', 'Subitem3Sentence',
        'Subitem4Sentence', 'Subitem5Sentence', 'Subitem6Sentence',
        'Subitem7Sentence', 'Subitem8Sentence', 'Subitem9Sentence',
        'Subitem10Sentence',
        'Column',
    ):
        decorate_column_sentence_group(el)

    elif el['tag'] == 'Table':
        decorate_table(el)

    elif el['tag'] == 'TableColumn':
        decorate_table_column(el)

    elif el['tag'] == 'AppdxTableTitle':
        appdx_table_title(el)

    for subel in el['children']:
        if isinstance(subel, str):
            continue
        decorate(subel)