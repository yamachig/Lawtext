from pathlib import Path

from docutils import nodes
from docutils.parsers.rst import Directive, directives
from docutils.utils.error_reporting import ErrorString

from lawtext import parse
from lawtext import render_htmlfragment


class LawTextDirective(Directive):
    has_content = True

    option_spec = {
        'file': directives.path,
        'encoding': directives.encoding,
    }

    def run(self):
        attributes = {
            'format': 'html',
        }
        encoding = self.options.get(
            'encoding', self.state.document.settings.input_encoding)

        if self.content:
            if 'file' in self.options:
                raise self.error(
                    '"%s" directive may not both specify an external file '
                    'and have content.' % self.name)
            lawtext = '\n'.join(self.content)

        elif 'file' in self.options:

            source_dir = Path(self.state.document.current_source).parent
            path = source_dir / self.options['file']
            try:
                lawtext = path.read_text(encoding)
                self.state.document.settings.record_dependencies.add(str(path))
            except IOError as error:
                raise self.severe(u'Problems with "%s" directive path:\n%s.'
                                  % (self.name, ErrorString(error)))
            except UnicodeError as error:
                raise self.severe(u'Problem with "%s" directive:\n%s'
                    % (self.name, ErrorString(error)))
            attributes['source'] = path

        law = parse(lawtext)
        rendered = render_htmlfragment(law)
        raw_node = nodes.raw('', rendered, **attributes)
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
