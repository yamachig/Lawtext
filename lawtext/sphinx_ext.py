from lawtext.parse import parse_lawtext
from lawtext.render import render_htmlfragment
from docutils import nodes
from docutils.parsers.rst import Directive
from pathlib import Path

class LawTextDirective(Directive):

    has_content = True

    def run(self):
        encoding = self.options.get(
            'encoding', self.state.document.settings.input_encoding)
        lawtext = '\n'.join(self.content)
        law = parse_lawtext(lawtext)
        rendered = render_htmlfragment(law)
        self.assert_has_content()
        raw_node = nodes.raw('', rendered, format='html')
        (raw_node.source, raw_node.line) = self.state_machine.get_source_and_line(self.lineno)
        return [raw_node]



def setup(app):

    def builder_inited(app_):
        if app_.builder.name != 'html':
            return
        app_.builder.config.html_static_path.append(str(Path(__file__).resolve().parent / 'static'))
        app_.add_stylesheet('law.css')

    app.connect('builder-inited', builder_inited)
    app.add_directive('lawtext', LawTextDirective)
