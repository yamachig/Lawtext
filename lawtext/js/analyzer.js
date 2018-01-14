"use strict";

var sha512 = require('hash.js/lib/hash/sha/512');

var LAWNUM_TABLE = require("./lawnum_table").LAWNUM_TABLE;

function get_law_name_length(law_num) {
    let digest = sha512().update(law_num).digest('hex')
    let key = parseInt(digest.slice(0, 7), 16);
    return LAWNUM_TABLE[key];
}

var toplevel_container_tags = [
    'EnactStatement', 'MainProvision', 'SupplProvision', 'AppdxTable', 'AppdxStyle',
];

var article_container_tags = [
    'Part', 'Chapter', 'Section', 'Subsection', 'Division',
];

var sentence_container_tags = [
    "Article", "Paragraph",
    'Item', 'Subitem1', 'Subitem2', 'Subitem3',
    'Subitem4', 'Subitem5', 'Subitem6',
    'Subitem7', 'Subitem8', 'Subitem9',
    'Subitem10',
];

var container_tags = []
    .concat(toplevel_container_tags)
    .concat(article_container_tags)
    .concat(sentence_container_tags);

var ignore_sentence_tag = [
    "LawNum", "LawTitle",
    "TOC",
    "ArticleTitle", 'ParagraphNum', 'ItemTitle',
    'Subitem1Title', 'Subitem2Title', 'Subitem3Title',
    'Subitem4Title', 'Subitem5Title', 'Subitem6Title',
    'Subitem7Title', 'Subitem8Title', 'Subitem9Title',
    'Subitem10Title',
];

function extract_sentences(law) {

    let sentences = [];
    let containers = [];

    let extract = (el, _env) => {

        if(!el.tag) return;

        if(ignore_sentence_tag.indexOf(el.tag) >= 0) return;

        let env = {
            law_type: _env.law_type,
            container_stack: _env.container_stack.slice(),
            parents: _env.parents.slice(),
        };
        env.parents.push(el);

        let is_mixed = false;
        for(let subel of el.children) {
            if(typeof subel === "string") {
                is_mixed = true;
                break;
            }
        }

        if(is_mixed) {
            sentences.push([el, env]);
        } else {
            let is_container = container_tags.indexOf(el.tag) >= 0;
            if(is_container) {
                env.container_stack.push(el);
            }

            let start_sentence_index = sentences.length;
            for(let subel of el.children) {
                extract(subel, env, sentences);
            }
            let end_sentence_index = sentences.length; // half open

            if(is_container) {
                containers.push([
                    el,
                    [start_sentence_index, end_sentence_index],
                ]);
            }
        }
    };

    extract(
        law,
        {
            law_type: law.attr.LawType,
            container_stack: [],
            parents: [],
        },
    );

    return [sentences, containers];
}

class Declaration {
    constructor(type, name, value, scope, pos) {
        this.type = type;
        this.name = name;
        this.value = value;
        this.scope = scope;
        this.pos = pos;
    }
}

function detect_declarations(law, sentences) {
    let re_lawnum = /[(（]((?:明治|大正|昭和|平成)[一二三四五六七八九十]+年\S+?第[一二三四五六七八九十百千]+号)/g;
    let re_lawdecl = /^(以下)?(?:([^。]+?)において)?「([^」]+)」という。/;

    let declarations = [];

    for(let sentence_index = 0; sentence_index < sentences.length; sentence_index++) {
        let [sentence, env] = sentences[sentence_index];
        for(let child_index = 0; child_index < sentence.children.length; child_index++) {
            let child = sentence.children[child_index];

            if(typeof child !== "string") continue;
            let str = child;

            let match = null;
            while((match = re_lawnum.exec(str)) !== null) {
                let parenth_pos = re_lawnum.lastIndex - match[0].length;
                let law_num = match[1];
                let law_name_length = get_law_name_length(law_num);
                let law_name_pos = parenth_pos - law_name_length;
                let law_name = str.slice(law_name_pos, law_name_pos + law_name_length);

                if(!law_name) continue;

                let scope = null;
                let name = law_name;
                let end_pos = parenth_pos; // half open

                if(str[re_lawnum.lastIndex] == "）") {
                    scope = "global";
                    end_pos = re_lawnum.lastIndex + 1;
                } else if(str[re_lawnum.lastIndex] == "。") {
                    let m = str.slice(re_lawnum.lastIndex + 1).match(re_lawdecl);
                    if(m) {
                        end_pos = re_lawnum.lastIndex + 1 + m[0].length;
                        name = m[3];
                        scope = {
                            following: m[1] !== null,
                            scope: m[2] || null,
                        };
                    }
                }

                let pos = {
                    sentence: sentence,
                    sentence_index: sentence_index,
                    child_index: child_index,
                    text_index: law_name_pos,
                    length: end_pos - law_name_pos,
                    env: env,
                };

                declarations.push(new Declaration(
                    "LawName", // type
                    name,      // name
                    law_num,   // value
                    scope,     // scope
                    pos,       // pos
                ));
            }
        }
    }

    return declarations;
}

function analyze(law) {
    let [sentences, containers] = extract_sentences(law);
    let declarations = detect_declarations(law, sentences);

    console.error(`${sentences.length} sentences detected.`);
    console.error(`${containers.length} containers detected.`);
    for(let i = 0; i < sentences.length; i++) {
        let [sentence, env] = sentences[i];
        console.error(`sentences[${i}]: <${sentence.tag}>`);
    }
    for(let declaration of declarations) {
        console.error(declaration);
    }

    let ret = {
        declarations: declarations,
    };
    return ret;
}

if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.analyze = analyze;
    exports.get_law_name_length = get_law_name_length;
}
