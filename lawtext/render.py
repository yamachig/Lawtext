from pathlib import Path
from io import BytesIO
from zipfile import ZipFile, ZIP_DEFLATED

from jinja2 import Environment, FileSystemLoader

env = Environment(loader=FileSystemLoader(str(Path(__file__).parent.resolve() / 'templates'), encoding='utf8'))



def element_to_json(el):
    children = []
    text = (el.text or '').strip()
    if text:
        children.append(text)
    for subel in el:
        children.append(element_to_json(subel))
        tail = (subel.tail or '').strip()
        if tail:
            children.append(tail)
    return {
        'tag': el.tag,
        'attr': el.attrib,
        'children': children,
    }

def render_htmlfragment(law):
    template = env.get_template('htmlfragment.html')
    return template.render({'law': law, 'context': Context()})



def render_html(law):
    template = env.get_template('html.html')
    style = (Path(__file__).parent.resolve() / 'static/law.css').read_text(encoding='utf-8')
    return template.render({'law': law, 'style': style, 'context': Context()})

def render_xml(law):
    template = env.get_template('xml.xml')
    return template.render({'law': law})

def render_lawtext(law):
    template = env.get_template('lawtext.j2')
    return template.render({'law': law, 'context': Context()})



def restructure_table(table):
    new_table_children = []
    rowspan_state = {}
    colspan_value = {}
    for row in table['children']:
        if row['tag'] != 'TableRow':
            new_table_children.append(row)
            continue
        new_row_children = []
        c = 0
        ci = 0
        while True:
            rss = rowspan_state.get(c, 0)

            if rss:
                colspan = colspan_value.get(c, 0)
                new_row_children.append({
                    'tag': 'TableColumnMerged',
                    'attr': {
                        'colspan': colspan,
                    } if colspan else {},
                    'children': [],
                })
                rowspan_state[c] = rss - 1
                if colspan:
                    c += colspan - 1
                c += 1
                continue

            if ci >= len(row['children']):
                break

            column = row['children'][ci]
            new_row_children.append(column)
            if column['tag'] != 'TableColumn':
                ci += 1
                continue

            colspan = int(column['attr'].get('colspan', 0))
            if 'rowspan' in column['attr']:
                rowspan = int(column['attr']['rowspan'])
                rowspan_state[c] = rowspan - 1
                colspan_value[c] = colspan
                if colspan:
                    c += colspan - 1

            c += 1
            ci += 1

        new_table_children.append({
            'tag': row['tag'],
            'attr': row['attr'],
            'children': new_row_children,
        })

    ret = {
        'tag': table['tag'],
        'attr': table['attr'],
        'children': new_table_children,
    }

    return ret



class Context:
    def __init__(self):
        self.data = {}
    def get(self, key):
        return self.data.get(key)
    def set(self, key, value):
        self.data[key] = value
        return ''



def render_docx(law):
    t_content_types = env.get_template('docx/[Content_Types].xml')
    t_rels = env.get_template('docx/_rels/.rels')
    t_document_rels = env.get_template('docx/word/_rels/document.xml.rels')
    t_document = env.get_template('docx/word/document.xml')
    t_styles = env.get_template('docx/word/styles.xml')

    s_content_types = t_content_types.render()
    s_rels = t_rels.render()
    s_document_rels = t_document_rels.render()
    s_document = t_document.render({
        'law': law,
        'restructure_table': restructure_table,
        'print': print,
        'context': Context(),
    })
    s_styles = t_styles.render()

    buffer = BytesIO()
    with ZipFile(buffer, mode='w', compression=ZIP_DEFLATED) as zipfile:
        zipfile.writestr('[Content_Types].xml', s_content_types)
        zipfile.writestr('_rels/.rels', s_rels)
        zipfile.writestr('word/_rels/document.xml.rels', s_document_rels)
        zipfile.writestr('word/document.xml', s_document)
        zipfile.writestr('word/styles.xml', s_styles)

    return buffer.getvalue()
