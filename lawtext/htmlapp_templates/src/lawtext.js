'use strict';

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

var Lawtext = Lawtext || {};

Lawtext.element_to_json = function(el) {
    var children = [];
    for (var i = 0; i < el.childNodes.length; i++) {
        var node = el.childNodes[i];
        if(node.nodeType == Node.TEXT_NODE) {
            var text = node.nodeValue.trim();
            if(text) {
                children.push(text);
            }
        } else if(node.nodeType == Node.ELEMENT_NODE) {
            children.push(Lawtext.element_to_json(node));
        } else {
            console.log(node);
        }
    }
    var attr = {};
    for (var i = 0; i < el.attributes.length; i++) {
        var at = el.attributes[i];
        attr[at.name] = at.value;
    }
    return {
        tag: el.tagName,
        attr: attr,
        children: children
    };
};

Lawtext.LawNameItem = function(law_name, law_no, promulgation_date) {
    var self = this;
    self.law_name = law_name;
    self.law_no = law_no;
    self.promulgation_date = promulgation_date;
};

Lawtext.law_name_data = [];

Lawtext.load_law_name_data = function() {
    var deferred = new $.Deferred();
    $.get("http://elaws.e-gov.go.jp/api/1/lawlists/1")
    .done(function(root){
        Lawtext.law_name_data = _.each(root.getElementsByTagName('LawNameListInfo'), function(el){
            var law_name = el.getElementsByTagName('LawName')[0].text;
            var law_no = el.getElementsByTagName('LawNo')[0].text;
            var promulgation_date = el.getElementsByTagName('PromulgationDate')[0].text;
            return new Lawtext.LawNameItem(law_name, law_no, promulgation_date);
        });
        deferred.resolve();
    });
    return deferred.promise();
};

Lawtext.xml_to_json = function(xml) {
    var parser = new DOMParser();
    var dom = parser.parseFromString(xml, 'text/xml');
    return Lawtext.element_to_json(dom.documentElement);
};

Lawtext.restructure_table = function(table) {
    var new_table_children = [];
    var rowspan_state = {};
    var colspan_value = {};
    _(table['children']).each(function(row){

        if(row['tag'] != 'TableRow') {
            new_table_children.push(row);
            return;
        }
        var new_row_children = [];
        var c = 0;
        var ci = 0;
        while(true){

            var rss = rowspan_state[c] || 0;
            if(rss) {
                var colspan = colspan_value[c] || 0;
                new_row_children.push({
                    tag: 'TableColumnMerged',
                    attr: colspan ? {
                        'colspan': colspan,
                    } : {},
                    children: [],
                });
                rowspan_state[c] = rss - 1;
                if(colspan) {
                    c += colspan - 1;
                }
                c += 1
                continue;
            }

            if(ci >= row['children'].length) {
                break;
            }

            var column = row['children'][ci];
            new_row_children.push(column);
            if(column['tag'] != 'TableColumn') {
                ci += 1;
                continue;
            }

            var colspan = Number(column['attr']['colspan'] || 0);
            if(_(column['attr']).has('rowspan')) {
                var rowspan = Number(column['attr']['rowspan']);
                rowspan_state[c] = rowspan - 1;
                colspan_value[c] = colspan;
                if(colspan) {
                    c += colspan - 1;
                }
            }
            c += 1;
            ci += 1;
        }

        new_table_children.push({
            tag: row['tag'],
            attr: row['attr'],
            children: new_row_children,
        });
     });

    var ret = {
        tag: table['tag'],
        attr: table['attr'],
        children: new_table_children,
    };

    return ret;
};

Lawtext.Context = function() {
    var self = this;
    self.data = {};
};
Lawtext.Context.prototype.get = function(key) {
    var self = this;
    return self.data[key];
};
Lawtext.Context.prototype.set = function(key, value) {
    var self = this;
    self.data[key] = value;
    return "";
};

Lawtext.render_law = function(template_name, law) {
    return nunjucks.render(template_name, {
        law: law,
        "print": console.log,
        "context": new Lawtext.Context()
    });
};

















Lawtext.Data = Backbone.Model.extend({
    defaults: {
        "law": null,
        "opening_file": false,
        "law_search_key": null,
    },

    initialize: function(options) {
        var self = this;

        self.open_file_input = $('<input>')
            .attr({
                type: 'file',
                accept: 'text/plain,application/xml',
            })
            .css({display: 'none'});
        $("body").append(self.open_file_input);
        self.open_file_input.change(function(e) { self.open_file_input_change(e); });
    },

    open_file: function() {
        var self = this;

        self.open_file_input.click();
    },

    open_file_input_change: function(evt) {
        var self = this;

        self.set({opening_file: true});

        var file = evt.target.files[0];
        var reader = new FileReader();
        reader.onload = (function(e) {
            $(evt.target).val('');
            var div = $('<div>');
            var text = e.target.result;
            self.load_law_text(text);
            self.set({law_search_key: null});
            self.trigger("file-loaded");
        });
        reader.readAsText(file);
    },

    load_law_text: function(text) {
        var self = this;

        var div = $('<div>');
        var law = null;
        if(/^(?:<\?xml|<Law)/.test(text.trim())) {
            law = Lawtext.xml_to_json(text);
        } else {
            try {
                law = _parse_decorate.parse_lawtext(text);
                _parse_decorate.decorate(law);
            } catch(err) {
                var err_str = err.__str__();
                var modal = $("#errorModal");
                var pre = $("<pre>")
                    .css({"white-space": "pre-wrap"})
                    .css({"line-height": "1.2em"})
                    .css({"padding": "1em 0"})
                    .html(err_str);
                modal.find(".modal-body").html(pre);
                modal.modal('show');
                law = null;
            }
        }
        if(law) {
            self.set({opening_file: false, law: law});
        } else {
            self.set({opening_file: false});
        }
    },

    search_law: function(law_search_key) {
        var self = this;

        self.set({opening_file: true});

        var load_law_num = function(lawnum) {
            var url = "https://lic857vlz1.execute-api.ap-northeast-1.amazonaws.com/prod/Lawtext-API?method=lawdata&lawnum=";
            url += encodeURI(lawnum);
            $.get(url)
            .done(function(data){
                var serializer = new XMLSerializer();
                var xml = serializer.serializeToString(data);
                self.load_law_text(xml);
            });
        };

        var lawnum = null;
        var re_lawnum = /(?:明治|大正|昭和|平成)\S+年\S+第\S+号/;
        var match = re_lawnum.exec(law_search_key);
        if(match) {
            lawnum = match[0];
            load_law_num(lawnum);
        } else {
            var url = "https://lic857vlz1.execute-api.ap-northeast-1.amazonaws.com/prod/Lawtext-API?method=lawnums&lawname=";
            url += encodeURI(law_search_key);
            $.get(url)
            .done(function(data){
                if(data.length) {
                    load_law_num(data[0][1]);
                    return;
                }
                self.set({opening_file: false});
            });
        }
    },

    get_law_name: function() {
        var self = this;

        var law = self.get('law');
        if(_(law).isNull()) return;

        var law_num = _(law.children).findWhere({tag: 'LawNum'});
        var law_body = _(law.children).findWhere({tag: 'LawBody'});
        var law_title = law_body && _(law_body.children).findWhere({tag: 'LawTitle'});

        var s_law_num = law_num ? law_num.children[0] : "";
        var s_law_title = law_title ? law_title.children[0] : "";
        s_law_num = (s_law_num && s_law_title) ? ("（" + s_law_num + "）") : s_law_num;

        return s_law_title + s_law_num;
    },

    download_docx: function() {
        var self = this;

        var law = self.get('law');
        if(_(law).isNull()) return;

        var s_content_types = nunjucks.render('docx/[Content_Types].xml');
        var s_rels = nunjucks.render('docx/_rels/.rels');
        var s_document_rels = nunjucks.render('docx/word/_rels/document.xml.rels');
        var s_document = nunjucks.render('docx/word/document.xml', {
            law: law,
            "restructure_table": Lawtext.restructure_table,
            "print": console.log,
            "context": new Lawtext.Context()
        });
        var s_styles = nunjucks.render('docx/word/styles.xml');

        var zip = new JSZip();
        zip.file('[Content_Types].xml', s_content_types)
        zip.file('_rels/.rels', s_rels)
        zip.file('word/_rels/document.xml.rels', s_document_rels)
        zip.file('word/document.xml', s_document)
        zip.file('word/styles.xml', s_styles)
        zip.generateAsync({
            type:"uint8array",
            compression: "DEFLATE",
            compressionOptions: {
                level: 9
            }
        })
        .then(function(buffer) {
            var blob = new Blob(
                [buffer],
                {type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
            );
            var law_name = self.get_law_name() || "lawtext_output";
            saveAs(blob, law_name + ".docx");
        });
    },

    download_lawtext: function() {
        var self = this;

        var law = self.get('law');
        if(_(law).isNull()) return;

        var s_lawtext = nunjucks.render('lawtext.j2', {
            law: law,
            "print": console.log,
            "context": new Lawtext.Context()
        });
        var blob = new Blob(
            [s_lawtext],
            {type: "text/plain"}
        );
        var law_name = self.get_law_name() || "lawtext_output";
        saveAs(blob, law_name + ".law.txt");
    },

    download_xml: function() {
        var self = this;

        var law = self.get('law');
        if(_(law).isNull()) return;

        var s_lawtext = nunjucks.render('xml.xml', {
            law: law,
            "print": console.log,
            "context": new Lawtext.Context()
        });
        var blob = new Blob(
            [s_lawtext],
            {type: "application/xml"}
        );
        var law_name = self.get_law_name() || "lawtext_output";
        saveAs(blob, law_name + ".xml");
    },
});

Lawtext.SidebarView = Backbone.View.extend({
    template: _.template(Lawtext.sidebar_view_template),
    tagName: "div",
    className: "lawtext-sidebar-view",

    initialize: function(options) {
        var self = this;

        self.data = options.data;
        self.listenTo(self.data, "change:law change:opening_file", self.render);
    },

    render: function(options) {
        var self = this;

        self.$el.html(self.template({
            data: self.data.attributes,
        }));
    },
});

Lawtext.HTMLpreviewView = Backbone.View.extend({
    template: _.template(Lawtext.htmlpreview_view_template),
    tagName: "div",
    className: "lawtext-htmlpreview-view",

    initialize: function(options) {
        var self = this;

        self.data = options.data;
        self.law_html = null;
        self.listenTo(self.data, "change:law", self.law_change);
        self.listenTo(self.data, "change:law change:opening_file", self.render);
        self.listenTo(self.data, "scroll-to-law-anchor", self.scroll_to_law_anchor);
    },

    law_change: function(options) {
        var self = this;

        self.law_html = null;
    },

    render: function(options) {
        var self = this;

        var law = self.data.get('law');
        if(!_(law).isNull() && _(self.law_html).isNull()) {
            self.law_html = Lawtext.render_law('htmlfragment.html', law);
        }

        self.$el.html(self.template({
            data: self.data.attributes,
            law_html: self.law_html,
        }));
    },

    scroll_to_law_anchor: function(tag, name) {
        var self = this;

        self.$(".law-anchor").each(function(){
            var obj = $(this);
            if(obj.data('tag') == tag && obj.data('name') == name) {
                $('html,body').animate({scrollTop: obj.offset().top}, 'normal');
            }
        });
    },
});

Lawtext.MainView = Backbone.View.extend({
    template: _.template(Lawtext.main_view_template),
    tagName: "div",
    className: "lawtext-main-view",

    events: {
        "click .lawtext-open-file-button": "open_file_button_click",
        "click .lawtext-download-sample-lawtext-button": "download_sample_lawtext_button_click",
        "click .search-law-button": "search_law_button_click",
        "click .lawtext-download-docx-button": "download_docx_button_click",
        "click .lawtext-download-lawtext-button": "download_lawtext_button_click",
        "click .lawtext-download-xml-button": "download_xml_button_click",
        "click .law-link": "law_link_click",
    },

    initialize: function(options) {
        var self = this;

        self.data = options.data;
        self.router = options.router;

        self.sidebar_view = new Lawtext.SidebarView({
            data: Lawtext.data,
        });
        self.htmlpreview_view = new Lawtext.HTMLpreviewView({
            data: Lawtext.data,
        });

        self.listenTo(self.data, "change:law_search_key", self.law_search_key_change);
        self.listenTo(self.data, "change:law", self.law_change);
    },

    render: function(options) {
        var self = this;

        self.sidebar_view.$el.detach();
        self.htmlpreview_view.$el.detach();

        self.$el.html(self.template({
        }));

        self.$(".lawtext-sidebar-view-place").replaceWith(self.sidebar_view.el);
        self.sidebar_view.render();
        self.$(".lawtext-htmlpreview-view-place").replaceWith(self.htmlpreview_view.el);
        self.htmlpreview_view.render();
    },

    search_law_button_click: function(e) {
        var self = this;
        var obj = $(e.currentTarget);

        var textbox = obj.parent().parent().find(".search-law-textbox");
        var text = textbox.val().trim();

        self.router.navigate(text, {trigger: true});

        return false;
    },

    open_file_button_click: function(e) {
        var self = this;

        self.data.open_file();
    },

    download_sample_lawtext_button_click: function(e) {
        var self = this;

        var blob = new Blob(
            [Lawtext.sample_lawtext],
            {type: "text/plain"}
        );
        saveAs(blob, "sample_lawtext.law.txt");
    },

    download_docx_button_click: function(e) {
        var self = this;

        self.data.download_docx();
    },

    download_lawtext_button_click: function(e) {
        var self = this;

        self.data.download_lawtext();
    },

    download_xml_button_click: function(e) {
        var self = this;

        self.data.download_xml();
    },

    law_link_click: function(e) {
        var self = this;
        var obj = $(e.currentTarget);

        self.data.trigger("scroll-to-law-anchor", obj.data("tag"), obj.data("name"));
    },

    law_search_key_change: function() {
        var self = this;

        var law_search_key = self.data.get("law_search_key");

        if(law_search_key) {
            self.data.search_law(law_search_key);
        }
    },

    law_change: function() {
        var self = this;

        var law = self.data.get("law");
        var law_search_key = self.data.get("law_search_key");

        if(law && law_search_key) {
            var law_body = _(law.children).findWhere({tag: "LawBody"});
            var law_title = _(law_body.children).findWhere({tag: "LawTitle"});
            document.title = law_title.children[0] + " | Lawtext";
        } else {
            document.title = "Lawtext";
        }
    },
});

Lawtext.Router = Backbone.Router.extend({
    routes: {
        ":law_search_key": "law",
        "": "index",
    },

    initialize: function(options) {
        var self = this;

        self.data = options.data;

        self.listenTo(self.data, "file-loaded", function(){
            self.navigate("", {trigger: false});
        });
    },

    law: function(law_search_key) {
        var self = this;

        self.data.set({law_search_key: law_search_key});
    },

    index: function() {
        var self = this;

        self.data.set({law_search_key: null, law: null});
    }
});

$(function(){

    Lawtext.data = new Lawtext.Data();

    Lawtext.router = new Lawtext.Router({
        data: Lawtext.data,
    });

    Lawtext.main_view = new Lawtext.MainView({
        data: Lawtext.data,
        router: Lawtext.router,
    });
    $(".lawtext-main-view-place").replaceWith(Lawtext.main_view.el);
    Lawtext.main_view.render();

    Backbone.history.start({pushState: false});

    $(".search-law-textbox").focus();

});
