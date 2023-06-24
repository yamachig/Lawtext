Lawtext: Manageable plain text format and utility tools for laws (core library / CLI)
========================================================================

**Lawtext** is a human-readable/editable plain text format designed for Japanese laws.

Lawtext works efficiently with existing source code management tools to make law text management open, safe, and creative.

- [Examples](#examples)
- [Background](https://github.com/yamachig/Lawtext#background-en)
- [Frontends](https://github.com/yamachig/Lawtext)
- [How to use CLI](#usage)
- [Technical detail](./docs/readme.md)

This package ([`lawtext-core` repository](https://github.com/yamachig/Lawtext-core)) is a core library / CLI as a part of the [Lawtext](https://github.com/yamachig/Lawtext) project. See [Lawtext](https://github.com/yamachig/Lawtext) for background.

------------

**Lawtext** は、法令標準XMLとの間で相互変換可能な法令のプレーンテキストフォーマットです。読みやすく、人の手により編集しやすいように設計されています。

Lawtextを用いると、既存のソースコード管理ツールを法令管理にそのまま活用することができます。また、法令標準XMLを使用する高度な法令管理ツールと共存することができます。これにより、法令文書のオープン化を容易にし、編集作業をより安全にし、法令執務の創造性を高めることができます。

- [例](#examples)
- [背景](https://github.com/yamachig/Lawtext#background-jp)
- [フロントエンド](https://github.com/yamachig/Lawtext)
- [CLIの使用方法](#usage)
- [技術詳細](./docs/readme.md)

このパッケージ（[`lawtext-core` リポジトリ](https://github.com/yamachig/Lawtext-core)）は [Lawtext](https://github.com/yamachig/Lawtext) プロジェクトの一部であるコアライブラリ / CLIです。背景の詳細は [Lawtext](https://github.com/yamachig/Lawtext) を参照してください。

------------

<a id="examples"></a>

## Examples

### Example of Lawtext
```
行政手続法
（平成五年法律第八十八号）

      第一章　総則

  （目的等）
第一条　この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。
２　処分、行政指導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項について、他の法律に特別の定めがある場合は、その定めるところによる。
```
- [Download a sample of Lawtext for a whole law](https://yamachig.github.io/lawtext-app/#/(sample) )

<details>
<summary>Standard law XML generated from the lawtext above (click to open)</summary>

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

### VSCode extension ([detail](https://github.com/yamachig/Lawtext#try-vscode-extension))

[![vscode-screenshot1](https://user-images.githubusercontent.com/26037044/164368148-aef50430-c994-4a53-b1fc-d26471860e29.gif)](https://user-images.githubusercontent.com/26037044/164368148-aef50430-c994-4a53-b1fc-d26471860e29.gif)

### On GitHub ([example](https://github.com/yamachig/Lawtext-sample-Administrative-Procedure-Act/commit/8832079d99549b1c605e92bfd3774e79b10e58ed?diff=split))

[![github-screenshot1](https://user-images.githubusercontent.com/26037044/168134565-d8f2857d-a231-4200-aae4-fb8167bc9b0a.gif)](https://user-images.githubusercontent.com/26037044/168134565-d8f2857d-a231-4200-aae4-fb8167bc9b0a.gif) 



## Background

This package (core repository) is a part of the [Lawtext](https://github.com/yamachig/Lawtext) project. See [Lawtext](https://github.com/yamachig/Lawtext) for background.


## Frontends

See [Lawtext](https://github.com/yamachig/Lawtext) for frontend tools.


<a id="usage"></a>


## Usage

See [Lawtext](https://github.com/yamachig/Lawtext) for frontend tools.

### How to use

- Prerequisites: [Node.js](https://nodejs.org/)

#### Option 1: Run using `npx` globally

- Run `npx lawtext -h`

#### Option 2: Run as a package

- Run the following command in your working directory (or just an empty directory).
  - In case using the npm published version:
    ```
    npm install lawtext
    ```
  - In case using the GitHub development version:
    ```
    npm install https://github.com/yamachig/Lawtext-core
    ```
- Run `npx lawtext -h`

#### Option 3: Run independently

- Clone or download this repository and run `npm install` in the repository root.
- Run `npm run lawtext -h`


## Technical detail

See [Technical detail](./docs/readme.md).