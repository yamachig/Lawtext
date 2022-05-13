Lawtext: Manageable plain text format and utility tools for laws
========================================================================

<div style="display: flex; flex-direction: row; gap: 1em; flex-wrap: wrap;">

<div style="flex: 1 1 20em;">

## 法令を読む / Browsing laws

[![vscode-screenshot1](https://user-images.githubusercontent.com/26037044/167990468-37af141e-88f2-4a6e-9413-18116f1c55d2.gif)](https://user-images.githubusercontent.com/26037044/167990468-37af141e-88f2-4a6e-9413-18116f1c55d2.gif)

<div style="text-align: center;"><a href="https://yamachig.github.io/lawtext-app/#/%E5%B9%B3%E6%88%90%E4%BA%94%E5%B9%B4%E6%B3%95%E5%BE%8B%E7%AC%AC%E5%85%AB%E5%8D%81%E5%85%AB%E5%8F%B7" style="display: inline-block; border: 1px solid currentColor; padding: 0.5em;border-radius: 0.5em;" target="_blank" rel="noopener">試してみる / Try it</a></div>

</div>

<div style="flex: 1 1 20em;">

## 法令を編集する / Editing laws

[![vscode-screenshot1](https://user-images.githubusercontent.com/26037044/164368148-aef50430-c994-4a53-b1fc-d26471860e29.gif)](https://user-images.githubusercontent.com/26037044/164368148-aef50430-c994-4a53-b1fc-d26471860e29.gif)

<div style="text-align: center;"><a href="#try-vscode-extension" style="display: inline-block; border: 1px solid currentColor; padding: 0.5em;border-radius: 0.5em;" target="_blank" rel="noopener">試してみる / Try it</a></div>

</div>

</div>


------------

**Lawtext** は、法令標準XMLとの間で相互変換可能な法令のプレーンテキストフォーマットです。読みやすく、人の手により編集しやすいように設計されています。

Lawtextを用いると、既存のソースコード管理ツールを法令管理にそのまま活用することができます。また、法令標準XMLを使用する高度な法令管理ツールと共存することができます。これにより、法令文書のオープン化を容易にし、編集作業をより安全にし、法令執務の創造性を高めることができます。

- [例](#examples)
- [詳細](#background-jp)

------------

**Lawtext** is a human-readable/editable plain text format designed for Japanese laws.

Lawtext works efficiently with existing source code management tools to make law text management open, safe, and creative.

- [Examples](#examples)
- [Detail](#background-en)

------------



<a id="examples"></a>

## 例 / Examples

### Lawtextの例 / Example of Lawtext
```
行政手続法
（平成五年法律第八十八号）

      第一章　総則

  （目的等）
第一条　この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。
２　処分、行政指導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項について、他の法律に特別の定めがある場合は、その定めるところによる。
```
- [法令全体のLawtextサンプルをダウンロード / Download a sample of Lawtext for a whole law](https://yamachig.github.io/lawtext-app/#/(sample) )

<details>
<summary>（参考）上記の Lawtext を変換して生成した法令標準XML（クリックして表示） / Standard law XML generated from the lawtext above (click to open)</summary>

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

------------

### Lawtext を用いたバージョン管理のイメージ / Example of version management using Lawtext

- [GitHubで管理する例 / Example of managing in GitHub](https://github.com/yamachig/Lawtext-sample-Administrative-Procedure-Act/commit/8832079d99549b1c605e92bfd3774e79b10e58ed?diff=split)

[![github-screenshot1](https://user-images.githubusercontent.com/26037044/168134565-d8f2857d-a231-4200-aae4-fb8167bc9b0a.gif)](https://user-images.githubusercontent.com/26037044/168134565-d8f2857d-a231-4200-aae4-fb8167bc9b0a.gif)

------------


<a id="lawtext-app"></a>

### Lawtext-app: Lawtextフロントエンド兼汎用法令表示ツール / Lawtext-app: Lawtext frontend and general law visualization tool

- [Lawtext-appはこちら / Click here to go to Lawtext-app](https://yamachig.github.io/lawtext-app/)

#### Lawtext-app の主な特徴

- **法令閲覧**：Lawtextや法令標準XML（ファイルまたはe-LAWS APIから）を解析し、見やすく表示します。法令名や法令番号での検索ができます。
- **文書構造の解析・可視化**：対応する括弧や入れ子構造を解析し、可視化します。
- **定義語・条項参照の解析・可視化**：一部の用語（定義語）や条項の参照については、定義箇所を解析し、表示することができます。
- **WordやXML、Lawtextへの出力**：表示している法令を、Lawtextや法令標準XMLだけでなく、Microsoft Word文書（.docx）として出力できます。条文の引用に便利な、選択した条のみWordファイルに出力する機能もあります。
- **XMLの文書構造や正規表現を使用した高度な法令検索（Lawtext query）**：ブラウザのコンソールを用いて、XMLの文書構造や正規表現を使用した高度な法令検索を実行できます。
- **インストール不要（ブラウザで動作）**：ブラウザ上でシングルページアプリケーション（single-page application、SPA）として動作します。
- **オフライン環境を選択可能**：ローカルファイルからも実行でき、（オンラインの機能が不要であれば）オフライン環境でも実行できるため、機密性の高い場面にも適用することが可能です。（[ダウンロード版はこちら](https://yamachig.github.io/lawtext-app/#/download/)）

[![app-screenshot2](https://user-images.githubusercontent.com/26037044/167990468-37af141e-88f2-4a6e-9413-18116f1c55d2.gif)](https://user-images.githubusercontent.com/26037044/167990468-37af141e-88f2-4a6e-9413-18116f1c55d2.gif)

#### Main features of Lawtext-app

- It perses Lawtext, standard law XML (from local file or e-LAWS API) and shows as a easy-to-read web page with some navigating features.
- It analyses and vidualizes corresponding parentheses and nesting depth.
- It analyses and indicates term definition positions and clause number references.
- It can emit Microsoft Word document (.docx), Lawtext, and standard law XML of displayed law.
- It is a single-page application run on web browsers.
- In a confidential use-case, you can [download](https://yamachig.github.io/lawtext-app/#/download/) and run it offline.

------------


<a id="background-jp"></a>

## 背景

法令は、強い影響力のある文書の一つであり、法務分野だけでなく、ビジネス、学術の分野から関心を持たれています。そのため、法令文書やその変更はオープン・透明であることが期待されており、しかも、その編集作業は、いかなる間違いも許されないと考えられています。

しかしながら、日本の法令文書管理においてはいくつかの課題があります。

法令を編集する場面での課題：

- **条文の推敲と体裁の管理が分離されていない**：法令の編集作業は、条文内容の編集そのものというよりも、むしろ、レイアウトや書式の調整作業に終始してしまう傾向があります。これは、条文の内容と、（官報への入稿のための）原稿のレイアウトが、作業として分離されていないためです。このため、法令の編集には多くの時間と労力を要するだけでなく、条文の内容に誤りを生じやすくなります。
- **法令文書の保存方法が確立されていない**：法令文書を保存するファイル形式やレイアウト設定は必ずしも統一されていません。そのため、チームで法令を編集したり、古いファイルをメンテナンスしたりする作業は、単なる文面の修正といえるものではなく、異なるファイル形式が混在する中で、それぞれ異なる複雑なスタイル設定を分析する作業になってしまいます。これは、本来やりたい本質的な作業ではありません。
- **バージョン管理方法が確立されていない**：編集中の法令文書のバージョン管理は、最も素朴な手段である、ファイルのバックアップにより行われることが多いです。複数人で同時に編集すると、見つかりにくい“先祖返り”を引き起こします。
- **特定のアプリへの依存**：法令文書の編集は、レイアウト作業を同時に行う必要があるため、Microsoft Wordやジャストシステムの一太郎のような特定のアプリに依存しています。そのため、ベンダーロックインが生じる懸念があります。

法令を読む場面での課題：

- **再利用が困難**：公開されている法令データの多く（HTML、PDFなど）は、編集や比較のために再利用することができません。
- **比較が困難**：バージョンを比較する手段が存在しません。
- **可読性が低い**：そもそも法令の文書自体が、そのままではあまり読みやすいものではありません。特に、何段にも入れ子になった括弧など。

一方で、近年、日本の法令文書管理においていくつかのブレイクスルーがありました：

- [e-LAWS](http://www.soumu.go.jp/menu_news/s-news/01gyokan01_02000052.html)（2016年10月リリース)。法令文書の、政府内部での管理に用いられる、正式なデータベース・出版システムです。e-LAWSにより、現行の法律や省令などはデジタル形式で保存され、これが正式な文書として扱われるようになりました。
- [法令標準XML](https://elaws.e-gov.go.jp/download/)（2017年5月リリース）。法令を段落単位でマークアップする、標準化されたXML形式です。法律や省令などは、（既にあるHTML形式に加えて）法令標準XMLで公開されるようになりました。
- [e-Gov 法令 API](https://elaws.e-gov.go.jp/apitop/)（2017年6月リリース）。広く一般に利用可能な、法令標準XMLを提供するAPIです。
- [e-Gov 法令検索リニューアル](https://elaws.e-gov.go.jp/)（2020年11月リリース）。それまでHTML形式形式で公開され、きれいに印刷することが難しい状況でしたが、RTFやPDFのダウンロードにも対応しました。

e-LAWSや法令標準XMLは、法令執務の自動化の礎を築いたといえますが、しかしなお、いくつかの課題が残ります：

- **XMLの可読性**：XMLタグや構造は、法令文書の編集作業にとって本来本質的なものではなく、編集には別種の技能を要します。言い換えれば、XMLは、法令編集者にとって、あまり読み書きしやすいものではありません。
- **専用の編集ツール**：XMLを直接編集することを避けるため、e-LAWSでは専用の編集機能を提供していますが、これは新たなロックインにつながるおそれがあります。

  （参考）法令標準XMLの例（抜粋）：
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

法典のことを英語で「コード」と言いますが、プログラミングの分野やオープンソースコミュニティでは、上記のような課題は、最適化されたいくつかの手段によって解決されています：

- **可読性の高いプレーンテキスト**：ソースコードは扱いやすいプレーンテキストで書かれます。役割上、機械的に読める文書であることはもちろんですが、人が効率的に読み書きできるように工夫されています。単なるプレーンテキストなので、第三者が多くのツールを提供できます（その多くが無料です）。
- **オープンで汎用的な編集ツール**：様々な種類のエディタ（Visual Studio Codeなど）やビューアが存在します。多くが構文ハイライト機能を持っています。また、ナビゲーション機能を持っていたり、linterのような高度なツールと組み合わせることができるものもあります。
- **確立されたバージョン管理**：Gitをはじめとする高機能なバージョン管理システムが提供されています。バージョン管理は、一般に、プログラミングのワークフローにおける基本的な手法として認知されています。これにより意図しない“先祖返り”を防ぎ、また、チームによる共同作業を容易にします。
- **再利用・共同編集を前提とした保存・公開方法**：GitHubなどの公開リポジトリにおいて、ソースコードが読みやすく編集しやすい形で保管・共有されています。しかも、修正や意見を行うための機能と統合されています。


## 提案：Lawtext

これらの、法令文書管理にまつわる課題を解決する道具として、 **Lawtext** （拡張子 .law.txt）を提案します。Lawtextは、人が読み書きしやすい、日本の法令のためのプレーンテキスト形式です。

Lawtextを用いると、既存のソースコード管理ツールを法令管理にそのまま活用することができます。また、法令標準XMLを使用する高度な法令管理ツールと共存することができます。これにより、法令文書のオープン化を容易にし、編集作業をより安全にし、法令執務の創造性を高めることができます。

Lawtextは次のような特徴があります：

- **人が読み書きしやすい**：Lawtext（単なるプレーンテキスト）は、それ自体が読むための文書形式としても機能します。Lawtextの見た目は、印刷されたりWebページとして表示された法令とあまり変わりません。通常の文書を編集するようにLawtextを読み書きすることが可能です。複雑なスタイル管理に気を遣う必要はありません。この特徴は、Markdown、reStructuredText、YAMLなどを参考にしています。

  Lawtextの例（前述の法令標準XMLの例と同じ部分）：

  ```
  行政手続法
  （平成五年法律第八十八号）

        第一章　総則

    （目的等）
  第一条　この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。
  ２　処分、行政指導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項について、他の法律に特別の定めがある場合は、その定めるところによる。
  ```

- **法令標準XMLと相互変換できる**：Lawtextは法令標準XMLにコンパイルすることができます。したがって、Lawtextは、e-LAWSや、法令標準XMLを活用するあらゆるシステムと互換性があります。さらに、法令標準XMLを逆にLawtextに変換することもできます。そのため、公開されている法律や省令などのLawtextを入手することが可能です。Lawtextでも、法令標準XMLでも、都合の良い方で保存・共有することができます。

- **既存の汎用ソースコード管理・編集ツールを活用できる**：Lawtextは、GitHubのようなオンラインのソースコードリポジトリでもうまく表示できます（[GitHub上の例](https://github.com/yamachig/Lawtext-sample-Administrative-Procedure-Act/commit/8832079d99549b1c605e92bfd3774e79b10e58ed?diff=split)）。

  [![github-screenshot1](https://user-images.githubusercontent.com/26037044/168134565-d8f2857d-a231-4200-aae4-fb8167bc9b0a.gif)](https://user-images.githubusercontent.com/26037044/168134565-d8f2857d-a231-4200-aae4-fb8167bc9b0a.gif)

  そのほかにも、既存の汎用的なソースコード管理・編集ツールを効果的に活用することができます。一例として、 [Lawtextの編集を支援するVisual Studio Code拡張](https://marketplace.visualstudio.com/items?itemName=yamachi.lawtext) を提供しています。

  [![vscode-screenshot1](https://user-images.githubusercontent.com/26037044/164368148-aef50430-c994-4a53-b1fc-d26471860e29.gif)](https://user-images.githubusercontent.com/26037044/164368148-aef50430-c994-4a53-b1fc-d26471860e29.gif)


### Lawtext-app

Lawtext-appは、Lawtextを取り扱うフロントエンドツールです。また、e-Gov 法令APIを利用しているため、e-Gov法令検索のような汎用法令表示ツールとしても利用できます。

- [Lawtext-app（クリックして表示）](https://yamachig.github.io/lawtext-app/)

Lawtext-appは次の特徴を備えます：

- **法令閲覧**：Lawtextや法令標準XML（ファイルまたはe-LAWS APIから）を解析し、見やすく表示します。法令名や法令番号での検索ができます。
- **文書構造の解析・可視化**：対応する括弧や入れ子構造を解析し、可視化します。
- **定義語・条項参照の解析・可視化**：一部の用語（定義語）や条項の参照については、定義箇所を解析し、表示することができます。
- **WordやXML、Lawtextへの出力**：表示している法令を、Lawtextや法令標準XMLだけでなく、Microsoft Word文書（.docx）として出力できます。条文の引用に便利な、選択した条のみWordファイルに出力する機能もあります。
- **XMLの文書構造や正規表現を使用した高度な法令検索（Lawtext query）**：ブラウザのコンソールを用いて、XMLの文書構造や正規表現を使用した高度な法令検索を実行できます。
- **インストール不要（ブラウザで動作）**：ブラウザ上でシングルページアプリケーション（single-page application、SPA）として動作します。
- **オフライン環境を選択可能**：ローカルファイルからも実行でき、（オンラインの機能が不要であれば）オフライン環境でも実行できるため、機密性の高い場面にも適用することが可能です。（[ダウンロード版はこちら](https://yamachig.github.io/lawtext-app/#/download/)）

[![app-screenshot2](https://user-images.githubusercontent.com/26037044/167990468-37af141e-88f2-4a6e-9413-18116f1c55d2.gif)](https://user-images.githubusercontent.com/26037044/167990468-37af141e-88f2-4a6e-9413-18116f1c55d2.gif)

------------

<a id="background-en"></a>

## Background

Law is one of the most influential document types, which draws interest from legal, business, and academic area. It is considered that the text of law and changes in the law should be open and transparent, and editing law should not allow any mistake.

However, currently in Japan, managing law text has several problems.

Problems of editor side:

- Editing law ends up managing layout and font settings in a document editor, rather than editing text itself, because the document's editing process and presentation are not separated. It not only costs time and effort but also yields mistakes.
- The layout configuration of law files is not uniform. It causes editing law files in a team or maintaining old archived data is not as simple as just modifying text. It is like analyzing the complicated structure of styles, which is not essential.
- There is only primitive version control: copying files. Editing by multiple people often results in reversions hard to find.
- The whole workflow depends on specific apps like Microsoft Word and JustSystems Ichitaro. It causes vendor lock-in.

Problems of reader side:

- Most law data made available are in HTML or PDF, which are not reusable for editing.
- There is no way available to compare versions.
- Law text itself is not human-friendly: deeply nested parentheses, for example.
- When a law is under public comments, the only document made available is always PDF, which is hard to modify or compare.

Besides, recently, some breakthroughs are made in the field of Japanese law management:

- [e-LAWS](http://www.soumu.go.jp/menu_news/s-news/01gyokan01_02000052.html) (released in October 2016), authentic database and publishing system for laws, for use inside the government. By e-LAWS, all current law documents in Japan are formally stored as digital.
- [Standard law XML](https://elaws.e-gov.go.jp/download/) (released in May 2017), standardized paragraph-level markup format for Japanese laws. Most of the major Japanese laws are now made public as standard law XML (in addition to HTML already available).
- [e-Gov laws API](https://elaws.e-gov.go.jp/apitop/) (released in June 2017), an open web API which provides standard law XML.
- [Renewed e-Gov laws search](https://elaws.e-gov.go.jp/) (released in November 2020). Before renewal, it provided the laws HTML, which often could not be pretty-printed and are not reusable for editing. It now provides RTF or PDF.

  Example of Standard law XML (extracted):
  ```xml
  <?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <Law Era="Heisei" Lang="ja" LawType="Act" Num="88" Year="05">
      <LawNum>平成五年法律第八十八号</LawNum>
      <LawBody>
      <LawTitle>行政手続法</LawTitle>
      <MainProvision>
          <Chapter Delete="false" Hide="false" Num="1">
          <ChapterTitle>第一章　総則</ChapterTitle>
          <Article Delete="false" Hide="false" Num="1">
              <ArticleCaption>（目的等）</ArticleCaption>
              <ArticleTitle>第一条</ArticleTitle>
              <Paragraph Hide="false" Num="1" OldStyle="false">
              <ParagraphNum/>
              <ParagraphSentence>
                  <Sentence WritingMode="vertical">この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。</Sentence>
              </ParagraphSentence>
              </Paragraph>
              <Paragraph Hide="false" Num="2" OldStyle="false">
              <ParagraphNum>２</ParagraphNum>
              <ParagraphSentence>
                  <Sentence WritingMode="vertical">処分、行政指導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項について、他の法律に特別の定めがある場合は、その定めるところによる。</Sentence>
              </ParagraphSentence>
              </Paragraph>
          </Article>
          </Chapter>
      </MainProvision>
      </LawBody>
  </Law>
  ```

Although e-LAWS and standard law XML laid the foundation for automation of legislation, there are still some problems that remain:

- XML tags and structures are not an essential matter of laws themselves and require other skills to edit. In other words, XML is not readable/editable for law writers.
- e-LAWS provides a specially made editor to avoid writing XML directly. It may cause another lock-in.

In the field of programming and open source community (suggestive of the term "code"), several optimized solutions are available to solve such problems:

- Source codes are in a manageable plain text format. It is machine-readable by nature and designed so that people can read and edit them efficiently. Because they are just simple plain text files, many third-party useful (and often free) tools are available.
- Various kinds of source code editors (e.g. Visual Studio Code) and viewers are available. These editors and viewers typically have syntax highlighting features. Some of them provide navigation features, and more advanced tools like linters can be combined.
- Multifunctional version control systems are available (e.g. Git), which are generally the basis of programming workflow. They avoid reversions and make it easy for developers to collaborate in a team.
- Source codes are stored and shared on public repositories (e.g. GitHub) with changing history in human-readable and editable form. Modifying and commenting features are also integrated.


## Proposal

To solve such problems of law text management described above, I propose "**Lawtext**" (.law.txt), a human-readable/editable plain text format for Japanese laws.

### Lawtext

Lawtext has these features:

- A Lawtext document itself (just a plain text file) works well as a presentation format. It looks akin to what you read law on a printed/web page. You can read/edit a Lawtext like writing a regular document without managing complicated style configurations. This feature is made referring to Markdown, reStructuredText and YAML.

    Example of a Lawtext (of the same part as the XML example above):

    ```
    行政手続法
    （平成五年法律第八十八号）

          第一章　総則

      （目的等）
    第一条　この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。
    ２　処分、行政指導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項について、他の法律に特別の定めがある場合は、その定めるところによる。
    ```

- You can compile a Lawtext to a standard law XML. It means Lawtext is compatible with e-LAWS and any system utilizing standard law XML. Moreover, reversely, a standard law XML, can be converted to a Lawtext. Therefore, you can obtain the Lawtext of any existing law available online. You can store and share law documents in both forms of Lawtext or standard law XML as you like.
- Lawtext works effectively with existing source code management tools ([example on GitHub](https://github.com/yamachig/Lawtext-sample-Administrative-Procedure-Act/commit/8832079d99549b1c605e92bfd3774e79b10e58ed?diff=split)).  

  [![github-screenshot1](https://user-images.githubusercontent.com/26037044/168134565-d8f2857d-a231-4200-aae4-fb8167bc9b0a.gif)](https://user-images.githubusercontent.com/26037044/168134565-d8f2857d-a231-4200-aae4-fb8167bc9b0a.gif)

  Also, [the Lawtext language server for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=yamachi.lawtext) is available.

  [![vscode-screenshot1](https://user-images.githubusercontent.com/26037044/164368148-aef50430-c994-4a53-b1fc-d26471860e29.gif)](https://user-images.githubusercontent.com/26037044/164368148-aef50430-c994-4a53-b1fc-d26471860e29.gif)

- You can display Lawtext appropriately in an online source code repository such as GitHub ([example](https://github.com/yamachig/Lawtext-sample-Administrative-Procedure-Act/commit/8832079d99549b1c605e92bfd3774e79b10e58ed?diff=split)).


### Lawtext-app

Along with the Lawtext format, I also provide a utility tool, "Lawtext-app" ([working example](https://yamachig.github.io/lawtext-app/)), which utilizes Lawtext, standard law XML, and e-LAWS API.

Lawtext-app has these features:

- Lawtext-app is a single-page application run on web browsers. In a confidential use-case, you can [download](https://yamachig.github.io/lawtext-app/#/download/) and run it offline.
- It shows Lawtext, standard law XML (both from local file and e-LAWS API) as a web page with some navigating features.
- Lawtext-app is accompanied by an additional syntax analyzer and an elemental semantic analyzer of law text. For example, it shows corresponding parentheses and nesting depth. It also indicates term definition positions and clause number references.
- It can emit Microsoft Word document (.docx), Lawtext, and standard law XML of displayed law.

[![app-screenshot2](https://user-images.githubusercontent.com/26037044/167990468-37af141e-88f2-4a6e-9413-18116f1c55d2.gif)](https://user-images.githubusercontent.com/26037044/167990468-37af141e-88f2-4a6e-9413-18116f1c55d2.gif)


------------

<a id="try-vscode-extension"></a>

# Visual Studio Code 拡張機能を試す / Try the Visual Studio Code extension

<div style="max-width: 20em;">

[![vscode-screenshot1](https://user-images.githubusercontent.com/26037044/164368148-aef50430-c994-4a53-b1fc-d26471860e29.gif)](https://user-images.githubusercontent.com/26037044/164368148-aef50430-c994-4a53-b1fc-d26471860e29.gif)

</div>

- [こちらのリンク (github.dev)](https://github.dev/yamachig/vscode-lawtext-sample) から数クリックでお試しいただけます。（GitHubアカウントが必要です。リンク先でアカウントを作成できます。） / You can try the extension at [github.dev](https://github.dev/yamachig/vscode-lawtext-sample) with a few clicks. (GitHub account is required. You can create one at the linked page.)

- もしくは、[vscode.dev](https://vscode.dev/) にて [Lawtext拡張機能](https://marketplace.visualstudio.com/items?itemName=yamachi.lawtext) をインストールし、[サンプルLawtext](https://yamachig.github.io/lawtext-app/#/(sample)) を開くことでもお試しいただけます / Otherwise, you can visit [vscode.dev](https://vscode.dev/), install [Lawtext extension](https://marketplace.visualstudio.com/items?itemName=yamachi.lawtext) and open the [sample Lawtext](https://yamachig.github.io/lawtext-app/#/(sample)).

-----------

法令元データの取得に<a href="https://elaws.e-gov.go.jp/apitop/" target="_blank" rel="noreferrer">e-Gov法令API</a>を使用しています。定義語・条項参照などの表示は<a href="https://github.com/yamachig/lawtext" target="_blank" rel="noreferrer">Lawtext</a>で別途解析・編集したものです。