Technical detail of Lawtext
====================================================

This document explains the technical detail of Lawtext.

# The intermediate data representation: JsonEL and StdEL

Lawtext is a plain-text format for law (mainly targeting Japanese law). The Lawtext parser converts a Lawtext string into JSON data representing the law structure based on the [Standard Law XML Schema](https://elaws.e-gov.go.jp/file/XMLSchemaForJapaneseLaw_v3.xsd).

The extracted law structure is expressed internally in the parser using a generic format **JsonEL**. You can think of `JsonEL` as a highly simplified DOM (Document Object Model) of the corresponding XML that only supports the basic structure of XML. `JsonEL` itself does not depend on Standard Law XML Schema. Within the domain of the basic structure of XML, you can easily convert the `JsonEL` into XML and vice versa.

`JsonEL` definition ([source](../src/node/el/jsonEL.ts)):

```ts
interface JsonEL {
    tag: string;
    attr: Record<string, string | undefined>;
    children: (JsonEL | string)[];
}
```

**StdEL** ([source](../src/law/std/stdEL.ts)) is a special type of `JsonEL` that complies with the Standard Law XML Schema. A `StdEL` object has a tag name, corresponding attributes, and children defined in the Standard Law XML Schema. The Lawtext parser aims to convert the Lawtext string into the `StdEL` tree.

The `StdEL` works as an intermediate representation of the law. The Lawtext library provides several renderers that enable converting the law (`StdEL`) into HTML, docx, Standard Law XML, and Lawtext (reversely).

# Examples of Lawtext, standard law XML, and StdEL representation

A Lawtext string looks like the one below:

```
行政手続法
（平成五年法律第八十八号）

      第一章　総則

  （目的等）
第一条　この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。
２　処分、行政指導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項について、他の法律に特別の定めがある場合は、その定めるところによる。
```

The standard law XML that corresponds to the Lawtext above looks like below:


<details>
<summary>The standard law XML generated from the Lawtext above (click to open)</summary>

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Lang="ja" LawType="Act" Num="88" Year="5">
  <LawNum>平成五年法律第八十八号</LawNum>
  <LawBody>
    <LawTitle>行政手続法</LawTitle>
    <MainProvision>
      <Chapter Delete="false" Hide="false" Num="1">
        <ChapterTitle>第一章　総則</ChapterTitle>
        <Article Delete="false" Hide="false" Num="1">
          <ArticleCaption>（目的等）</ArticleCaption>
          <ArticleTitle>第一条</ArticleTitle>
          <Paragraph Delete="false" Num="1" OldStyle="false">
            <ParagraphNum />
            <ParagraphSentence>
              <Sentence>この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。</Sentence>
            </ParagraphSentence>
          </Paragraph>
          <Paragraph Hide="false" OldStyle="false">
            <ParagraphNum>２</ParagraphNum>
            <ParagraphSentence>
              <Sentence>処分、行政指導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項について、他の法律に特別の定めがある場合は、その定めるところによる。</Sentence>
            </ParagraphSentence>
          </Paragraph>
        </Article>
      </Chapter>
    </MainProvision>
  </LawBody>
</Law>
```
</details>

The `StdEL` representation of the law looks like below:

<details>
<summary>The `StdEL` representation of the law above (click to open)</summary>

```json
{
  "tag": "Law",
  "attr": {
    "Era": "Heisei",
    "Lang": "ja",
    "LawType": "Act",
    "Num": "88",
    "Year": "5"
  },
  "children": [
    { "tag": "LawNum", "attr": {}, "children": ["平成五年法律第八十八号"] },
    {
      "tag": "LawBody",
      "attr": {},
      "children": [
        { "tag": "LawTitle", "attr": {}, "children": ["行政手続法"] },
        {
          "tag": "MainProvision",
          "attr": {},
          "children": [
            {
              "tag": "Chapter",
              "attr": { "Delete": "false", "Hide": "false", "Num": "1" },
              "children": [
                {
                  "tag": "ChapterTitle",
                  "attr": {},
                  "children": ["第一章　総則"]
                },
                {
                  "tag": "Article",
                  "attr": { "Delete": "false", "Hide": "false", "Num": "1" },
                  "children": [
                    {
                      "tag": "ArticleCaption",
                      "attr": {},
                      "children": ["（目的等）"]
                    },
                    {
                      "tag": "ArticleTitle",
                      "attr": {},
                      "children": ["第一条"]
                    },
                    {
                      "tag": "Paragraph",
                      "attr": {
                        "Delete": "false",
                        "Num": "1",
                        "OldStyle": "false"
                      },
                      "children": [
                        { "tag": "ParagraphNum", "attr": {}, "children": [""] },
                        {
                          "tag": "ParagraphSentence",
                          "attr": {},
                          "children": [
                            {
                              "tag": "Sentence",
                              "attr": {},
                              "children": [
                                "この法律は、処分、行政指導及び届出 に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによっ て、行政運営における公正の確保と透明性（行政上の意思決定について、その内容 及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の 向上を図り、もって国民の権利利益の保護に資することを目的とする。"
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "tag": "Paragraph",
                      "attr": { "Hide": "false", "OldStyle": "false" },
                      "children": [
                        {
                          "tag": "ParagraphNum",
                          "attr": {},
                          "children": ["２"]
                        },
                        {
                          "tag": "ParagraphSentence",
                          "attr": {},
                          "children": [
                            {
                              "tag": "Sentence",
                              "attr": {},
                              "children": [
                                "処分、行政指 導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項 について、他の法律に特別の定めがある場合は、その定めるところによる。"
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```
</details>


# Parsing steps

The goal of the Lawtext parser is to extract the law content that the original Lawtext expresses and obtain it as `StdEL`. The parser processes the Lawtext in three steps to achieve that goal:

1. Parse the Lawtext into a CST (Concrete Syntax Tree). The CST is a sequence of `Line`s ([source of `Line`](../src/node/cst/line.ts)).
2. Analyze the indentation of `Lines` and inserts indent (one increase of indent level) / dedent (one decrease of indent level) markers between the lines. The output of this step is a sequence of `VirtualLine`s ([source of `VirtualLine`](../src/parser/std/virtualLine.ts)).
3. Parse the `VirtualLine`s into a `StdEL` tree ([source of `StdEL`](../src/law/std/stdEL.ts)).

The Lawtext CST is a sequence of `Line`s. A `Line` represents a physical line in the Lawtext string and contains all detailed features in the original string (not included in the resulting `StdEL` tree), such as verbose blank lines, meaningless whitespaces, and physical position (line and character index).

Instead of directly parsing the Lawtext into `StdEL`, we adopted the intermediate CST representation (`Line`s) for the following reasons.

- We can simplify the following process of parsing `Line`s into a `StdEL` tree because the Lawtext syntax has a line-based structure.
- We can use the same CST to render the law into Lawtext and format Lawtext.
- We need detailed position information to provide a language server in source code editors such as Visual Studio Code.

During parsing the CST into a `StdEL` tree, the parser first analyzes the structure of indented blocks (indent levels) and inserts indent (one increase of indent level) / dedent (one decrease of indent level) markers between the lines. The resulting structure is a sequence of `VirtualLine`s, and the main part of parsing is conducted on the sequence of `VirtualLine`s.

We made the indentation analysis separate from building CST because the virtual (logical) indent levels in Lawtext do not always match the physical (visual) indent levels. For example, the article caption line in the Lawtext sample above (`␣␣（目的等）`) has one full-width (two ASCII-width) whitespace indentation. This whitespace complies with the layout rule of traditional Japanese law texts for visual compatibility. However, the article caption line does not make a new indentation level, and we have to consider the context of the lines to understand the line is an article caption, not a part of indented lines. Therefore, the Lawtext parser first parses the physical indent levels (and output `Line`s) and then detects the virtual indent levels (and output `VirtualLine`s).

For steps 1 and 3, the main process of parsing is recursive descent parsing of a string (a sequence of characters) and `VirtualLine`s, respectively. We utilize a generic recursive descent parser [`generic-parser`](https://github.com/yamachig/generic-parser) for both steps.


# Lawtext syntax

Please refer to the comments in the following source codes for the detailed syntax of Lawtext.

- [`src/node/cst/line.ts`](../src/node/cst/line.ts) describes the types of `Line`s and links to the codes that contain the actual syntax definition by [`generic-parser`](https://github.com/yamachig/generic-parser) to convert a Lawtext string to a sequence of `Line`s.
- [`src/parser/std/virtualLine.ts`](../src/parser/std/virtualLine.ts) describes the types of `VirtualLine`s and the steps to convert a sequence of `Line`s to `VirtualLine`s.
- [`src/parser/std/rules/$law.ts`](../src/parser/std/rules/$law.ts) is the entry point of the parser that converts a sequence of `VirtualLine`s to [`StdEL`](../src/law/std/stdEL.ts). It contains the actual syntax definition by [`generic-parser`](https://github.com/yamachig/generic-parser), and you can follow the defined rule to find syntax definitions for other element types.
