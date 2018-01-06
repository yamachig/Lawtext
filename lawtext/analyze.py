import re

re_LawNum = re.compile(r'(?P<era>明治|大正|昭和|平成)(?P<year>[一二三四五六七八九十]+)年(?P<law_type>\S+?)第(?P<num>[一二三四五六七八九十百千]+)号')

def replace_lawnum(text):
    def repl(match):
        s = match.group(0)
        t = f'<span class="lawtext-analyzed lawtext-analyzed-lawnum" data-lawnum="{s}">{s}</span>'
        return t
    return re_LawNum.sub(repl, text)

re_ParStartAny = re.compile(r'[(（「]')
re_ParEndAny = re.compile(r'[)）」]')

re_ParStartSquare = re.compile(r'[」]')
re_ParEndSquare = re.compile(r'[」]')

def replace_parenthesis(mixed):
    square_count = 0
    start_pos = []
    pairs = []

    ret = list(mixed)

    for i, node in enumerate(mixed):
        if not isinstance(node, str):
            continue
        text = node
        search_start_pos = 0

        while True:
            if len(text) <= search_start_pos:
                break

            if square_count:
                s_match = re_ParStartSquare.search(text[search_start_pos:])
                e_match = re_ParEndSquare.search(text[search_start_pos:])
            else:
                s_match = re_ParStartAny.search(text[search_start_pos:])
                e_match = re_ParEndAny.search(text[search_start_pos:])

            if not s_match and not e_match:
                break

            if s_match and e_match:
                if s_match.start() < e_match.start():
                    e_match = None
                else:
                    s_match = None

            if s_match:
                start_pos.append((i, s_match.start() + search_start_pos, s_match.end() + search_start_pos))
                if re_ParStartSquare.match(s_match.group(0)):
                    square_count += 1
                search_start_pos += s_match.end()
            elif e_match:
                if len(start_pos) > 0:
                    s_i, s_start, s_end = start_pos.pop()
                    pairs.append((
                        (s_i, s_start, s_end),
                        (i, e_match.start() + search_start_pos, e_match.end() + search_start_pos),
                    ))
                if square_count:
                    square_count -= 1
                search_start_pos += e_match.end()

    positions = []
    for (s_i, s_start, s_end), (e_i, e_start, e_end) in pairs:
        positions.append((s_i, s_start, s_end, 'start'))
        positions.append((e_i, e_start, e_end, 'end'))
    positions = sorted(
        positions,
        key=lambda x: x[0] * 1_000_000_000_000 + x[1] * 1_000_000 + x[2],
        reverse=True,
    )

    for i, start, end, _type in positions:
        text = mixed[i][start:end]
        rep = text
        if _type == 'start':
            if text in ('(', '（'):
                rep = f'<span class="lawtext-analyzed lawtext-analyzed-round-parentheses"><span class="lawtext-analyzed lawtext-analyzed-round-parenthesis-start">{text}</span><span class="lawtext-analyzed lawtext-analyzed-round-parentheses-content">'
            elif text in ('「',):
                rep = f'<span class="lawtext-analyzed lawtext-analyzed-square-parentheses"><span class="lawtext-analyzed lawtext-analyzed-square-parenthesis-start">{text}</span><span class="lawtext-analyzed lawtext-analyzed-square-parentheses-content">'
        elif _type == 'end':
            if text in (')', '）'):
                rep = f'</span><span class="lawtext-analyzed lawtext-analyzed-round-parenthesis-end">{text}</span></span>'
            elif text in ('」',):
                rep = f'</span><span class="lawtext-analyzed lawtext-analyzed-square-parenthesis-end">{text}</span></span>'

        ret[i] = ret[i][:start] + rep + ret[i][end:]

    return ret

def analyze_mixed(mixed):
    ret = []

    mixed = replace_parenthesis(mixed)

    for node in mixed:
        if isinstance(node, str):
            ret.append(replace_lawnum(node))
        else:
            ret.append(node)

    return ret

def analyze(el):
    el_children = el['children']
    mixed = False
    for se in el_children:
        if isinstance(se, str):
            mixed = True
            break
    if mixed:
        children = analyze_mixed(el_children)
    else:
        children = [
            analyze(subel)
            for subel in el_children
        ]

    return {
        'tag': el['tag'],
        'attr': el['attr'],
        'children': children,
    }
