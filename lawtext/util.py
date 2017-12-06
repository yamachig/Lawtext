import xml.etree.ElementTree as ET

def xml_to_json(xml):
    return element_to_json(ET.fromstring(xml))

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

def json_to_element(obj):
    el = ET.Element(obj['tag'], attrib=obj['attr'])
    last_subel = None
    for child in obj['children']:
        if isinstance(child, str):
            if last_subel:
                last_subel.tail = (last_subel.tail or '') + child
            else:
                el.text = (el.text or '') + child
        else:
            subel = json_to_element(child)
            el.append(subel)
            last_subel = subel
    return el
