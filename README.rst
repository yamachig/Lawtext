========================================================================
Lawtext: Manageable plain text format and utility tools for laws
========================================================================

**Lawtext** is human readable / editable plain text format designed for Japanese laws.

Lawtext works efficiently with existing source code management tools, so that it makes law text management open, safe and creative.

Lawtext is currently under development, however, basic feature is already available.

(Detailed description in English follows after Japanese text.)

------------

**Lawtext** は日本の法令のためのプレーンテキストフォーマットです。読みやすく、人の手により編集しやすいように設計されています。

Lawtextを用いると、既存のソースコード管理ツールをそのまま活用することができます。これにより、法令文書のオープン化を容易にし、編集作業をより安全にし、法令執務の創造性を高めることができます。

現在、Lawtextは開発中の状況ですが、基本的な機能は概ね動作します。


背景
========================

法令は、強い影響力のある文書の一つであり、法務分野だけでなく、ビジネス、学術の分野から関心を持たれています。そのため、法令文書やその変更はオープン・透明であることが期待されており、しかも、その編集作業は、いかなる間違いも許されないと考えられています。

しかしながら、日本の法令文書管理においてはいくつかの課題があります。

法令を編集する場面での課題：

- 法令の編集作業は、条文内容の編集そのものというよりも、むしろ、レイアウトや書式の調整作業に終始してしまう傾向があります。これは、条文の内容と、（官報への入稿のための）原稿のレイアウトが、作業として分離されていないためです。このため、法令の編集には多くの時間と労力を要するだけでなく、条文の内容に誤りを生じやすくなります。
- 法令文書ファイルのレイアウト設定は必ずしも統一されていません。そのため、チームで法令を編集したり、古いファイルをメンテナンスしたりする作業は、単なる文面の修正といえるものではなく、複雑なスタイル設定を分析する作業になってしまいます。これは、本来やりたい本質的な作業ではありません。
- 編集中の法令文書のバージョン管理は、最も素朴な手段である、ファイルのバックアップにより行われることが多いです。複数人で同時に編集すると、見つかりにくい“先祖返り”を引き起こします。
- 法令文書の編集は、Microsoft Wordやジャストシステムの一太郎のような、特定のアプリに依存してしまいます。そのため、ベンダーロックインが生じる懸念があります。

法令を読む場面での課題：

- 法令はHTML形式で公開されていますが、きれいに印刷することが難しいことが多く、また、編集のために再利用することができません。
- バージョンを比較する手段が存在しません。
- そもそも法令の文書自体が、そのままではあまり読みやすいものではありません。特に、何段にも入れ子になった括弧など。
- 法令がパブリックコメントに付される際には、PDFのみが公開されることが一般的です。PDFは編集や比較が困難です。

一方で、近年、日本の法令文書管理においていくつかのブレイクスルーがありました。

- `e-LAWS <http://www.soumu.go.jp/menu_news/s-news/01gyokan01_02000052.html>`__\ （2016年10月リリース)。法令文書の、政府内部での管理に用いられる、正式なデータベース・出版システムです。e-LAWSにより、日本のすべての現行法令はデジタル形式で保存され、これが正式な文書として扱われるようになりました。
- `法令標準XML <http://search.e-gov.go.jp/servlet/Public?CLASSNAME=PCMMSTDETAIL&id=145208896&Mode=2>`__\ （2017年5月リリース）。法令を段落単位でマークアップする、標準化されたXML形式です。日本のあらゆる法令は、（既にあるHTML形式に加えて）法令標準XMLで公開されるようになりました。
- `e-LAWS API <http://www.e-gov.go.jp/elaws/interface_api/index.html>`__\ （2017年6月リリース）。広く一般に利用可能な、法令標準XMLを提供するAPIです。

    法令標準XMLの例（抜粋）：

    .. sourcecode :: xml

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

e-LAWSや法令標準XMLは、法令執務の自動化の礎を築いたといえますが、しかしなお、いくつかの課題が残ります：

- XMLタグや構造は、法令文書の編集作業にとって本来本質的なものではなく、編集には別種の技能を要します。言い換えれば、XMLは、法令編集者にとって、あまり読み書きしやすいものではありません。
- XMLを直接編集することを避けるため、e-LAWSでは専用の編集機能を提供していますが、これは新たなロックインにつながるおそれがあります。

法典のことを英語で「コード」と言いますが、プログラミングの分野やオープンソースコミュニティでは、上記のような課題は、最適化されたいくつかの手段によって解決されていることがわかります。

- ソースコードは扱いやすいプレーンテキストで書かれます。役割上、機械的に読める文書であることはもちろんですが、人が効率的に読み書きできるように工夫されています。単なるプレーンテキストなので、第三者が多くのツールを提供できます（その多くが無料です）。
- 様々な種類のエディタやビューアが存在します。多くが構文ハイライト機能を持っています。また、ナビゲーション機能を持っていたり、linterのような高度なツールと組み合わせることができるものもあります。
- 高機能なバージョン管理システムが提供されています。バージョン管理は、一般に、プログラミングのワークフローにおける基本的な手法として認知されています。これにより意図しない“先祖返り”を防ぎ、また、チームによる共同作業を容易にします。
- 公開リポジトリにおいて、ソースコードが読みやすく編集しやすい形で保管・共有されています。しかも、修正や意見を行うための機能と統合されています。


提案
========================

これらの、法令文書管理にまつわる課題を解決する道具として、 **Lawtext** （拡張子 .law.txt）を提案します。Lawtextは、人が読み書きしやすい、日本の法令のためのプレーンテキスト形式です。

Lawtext
------------------------

Lawtextは次のような特徴があります：

- Lawtext（単なるプレーンテキスト）は、それ自体が読むための文書形式としても機能します。Lawtextの見た目は、印刷されたりWebページとして表示された法令とあまり変わりません。通常の文書を編集するようにLawtextを読み書きすることが可能です。複雑なスタイル管理に気を遣う必要はありません。この特徴は、reStructuredTextやMarkdownを参考にしています。

    Lawtextの例（前述の法令標準XMLの例と同じ部分）：

    .. sourcecode :: none

        行政手続法
        （平成五年法律第八十八号）

              第一章　総則

          （目的等）
        第一条　この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。
        ２　処分、行政指導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項について、他の法律に特別の定めがある場合は、その定めるところによる。

- Lawtextは法令標準XMLにコンパイルすることができます。したがって、Lawtextは、e-LAWSや、法令標準XMLを活用するあらゆるシステムと互換性があります。さらに、法令標準XMLを逆にLawtextに変換することもできます。そのため、公開されているあらゆる法令のLawtextを入手することが可能です。Lawtextでも、法令標準XMLでも、好きな方で保存・共有することができます。
- Lawtextを用いることで、既存のソースコード管理ツールを効果的に活用することができます。この一例として、\ `Lawtextを構文ハイライトするVisual Studio Code拡張 <https://marketplace.visualstudio.com/items?itemName=yamachi.lawtext>`__\ を提供しています。

  .. image:: https://github.com/yamachig/Lawtext/wiki/images/vscode-screenshot1.png
      :target: https://github.com/yamachig/Lawtext/wiki/images/vscode-screenshot1.png

- Lawtextは、GitHubのようなオンラインのソースコードリポジトリでもうまく表示できます。（\ `例 <https://github.com/yamachig/Lawtext-sample-Administrative-Procedure-Act/commit/8832079d99549b1c605e92bfd3774e79b10e58ed?diff=split>`__\ ）


Lawtext-app
------------------------

Lawtextの文書フォーマットに加えて、ユーティリティツールである「Lawtext-app」（\ `実際に動作する例 <https://yamachig.github.io/lawtext-app/>`__\ ）を提供しています。Lawtext-appは、Lawtextと法令標準XML、e-LAWS APIを応用しています。

.. image:: https://github.com/yamachig/Lawtext/wiki/images/app-screenshot2.png
    :target: https://github.com/yamachig/Lawtext/wiki/images/app-screenshot2.png

Lawtext-appは次の特徴を備えます：

- Lawtext-appはシングルページアプリケーション（single-page application、SPA）として実装されており、ブラウザ上で動作します。ローカルファイル（\ `ダウンロード <https://yamachig.github.io/lawtext-app/download.html>`__\ ）からも実行でき、また、（オンラインの機能が不要であれば）オフライン環境でも実行できます。したがって、機密性の高い場面にも適用することが可能です。
- Lawtextや法令標準XML（ローカルファイルから、又はe-LAWS APIから）を、ナビゲーション機能付きのWebページとして表示します。
- Lawtext-appは、追加的な構文解析器や簡単な意味解析器を搭載しており、対応する括弧や入れ子構造を表示したり、用語の定義箇所を表示することができます。
- 表示している法令を、Lawtextや法令標準XMLだけでなく、Microsoft Word文書（.docx）として出力できます。


------------


Background
========================

Law is one of the most effective type of document, which draws interest from legal, business and academic area. It is considered that text of law and changes in law should be open and transparent; and that editing law should not allow any mistake.

However, currently in Japan, managing law text has several problems.

Problems of editor side:

- Editing laws ends up managing layout and font settings in document editor, rather than editing text itself, because editing process of text and presentation of document are not separated. It does not only cost time and efforts, but also yield mistakes.
- Layout configuration of law files is not uniform, therefore, editing law files in team or maintaining archived old file is not as simple as just modifying text, but like analyzing complicated structure of styles, which is not essential.
- There is only primitive version control: copying files. Editing by multiple people often results in reversions hard to find.
- Depends on specific apps like Microsoft Word and JustSystems Ichitaro. It causes vendor lock-in.

Problems of reader side:

- Although laws are available online as HTML, they often could not be pretty printed and are not reusable for editing.
- There is no way available to compare versions.
- Law text itself is not human friendly. Especially deep nested parentheses.
- When an law is under public comments, always only PDF is made available, which is hard to modifiy or compare.

Besides, recently, some breakthroughs are made in the field of Japanese law management:

- `e-LAWS <http://www.soumu.go.jp/menu_news/s-news/01gyokan01_02000052.html>`__ (released in October 2016), authentic database and publishing system for laws, for use inside government. By e-LAWS, all current laws in Japan are formally stored as digital.
- `Standard law XML <http://search.e-gov.go.jp/servlet/Public?CLASSNAME=PCMMSTDETAIL&id=145208896&Mode=2>`__ (released in May 2017), standardized paragraph-level markup format for Japanese laws. Any law in Japan is now provided to the public as standard law XML (in addition to HTML already available).
- `e-LAWS API <http://www.e-gov.go.jp/elaws/interface_api/index.html>`__ (released in June 2017), open web API which provides standard law XML.

    Example of Standard law XML (extracted):

    .. sourcecode :: xml

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

Although e-LAWS and standard law XML laid the foundation for automation of legislation, there are still some problems remain:

- XML tags and structures is not an essential matter of laws themselves and requires other skills to edit. In other words, XML is not readable/editable for law writers.
- To avoid editing XML directly, e-LAWS provides a special editor. It may cause another lock-in.

In the field of programming and open source community (suggestive of the term "code"), such problems are solved with several optimized means:

- Source codes are written in manageable plain text format. It is not only machine-readable by nature, but also designed so that human can read and edit them efficiently. Because they are just simple plain text files, many third-party useful (and often free) tools are available.
- Various kinds of source code editors and viewers. These editors and viewers normally have syntax highlighting features. Some of them provides navigation features and can be combined with more advanced tools like linters.
- Multifunctional version control systems, which are generally considered as the basis of programming work flow. They avoids reversions and make it easy for developers to collaborate in team.
- Source codes are stored and shared on public repository with history of changing, in human readable and editable form. Modifying and commenting features are also integrated.


Proposal
========================

To solve such problems of law text management described above, I propose "\ **Lawtext**\ " (.law.txt), human readable / editable plain text format for Japanese laws.

Lawtext
------------------------

Lawtext has these features:

- A Lawtext document itself (just a plain text) works well as presentation format. It looks akin to what you look a law in printed/web page. You can read/edit Lawtext like editing normal document without managing complicated style configurations. This feature is made with reference to reStructuredText and Markdown.

    Example of Lawtext (of the same part as the XML example above):

    .. sourcecode :: none

        行政手続法
        （平成五年法律第八十八号）

              第一章　総則

          （目的等）
        第一条　この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。
        ２　処分、行政指導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項について、他の法律に特別の定めがある場合は、その定めるところによる。

- Lawtext can be compiled to standard law XML. This means Lawtext is compatible with e-LAWS and any system utilizing standard law XML. Moreover, reversely, standard law XML can be converted to Lawtext. This means you can obtain Lawtext of any existing law available online. You can store and share law documents in both form of Lawtext or standard law XML as you like.
- Lawtext works effectively with existing source code management tools. As an example, `Lawtext syntax highlighter for Visual Studio Code <https://marketplace.visualstudio.com/items?itemName=yamachi.lawtext>`__ is provided.

  .. image:: https://github.com/yamachig/Lawtext/wiki/images/vscode-screenshot1.png
      :target: https://github.com/yamachig/Lawtext/wiki/images/vscode-screenshot1.png

- Lawtext can be viewed properly in online source code repository such as GitHub (\ `example <https://github.com/yamachig/Lawtext-sample-Administrative-Procedure-Act/commit/8832079d99549b1c605e92bfd3774e79b10e58ed?diff=split>`__\ ).


Lawtext-app
------------------------

Along with the Lawtext format, I also provide an utility tool "Lawtext-app" (\ `working example <https://yamachig.github.io/lawtext-app/>`__\ ), which utilizes Lawtext, standard law XML and e-LAWS API.

.. image:: https://github.com/yamachig/Lawtext/wiki/images/app-screenshot2.png
    :target: https://github.com/yamachig/Lawtext/wiki/images/app-screenshot2.png

Lawtext-app has these features:

- Lawtext-app is an single-page application runs on web browsers. It also can run from local file (\ `download <https://yamachig.github.io/lawtext-app/download.html>`__\ ) and in offline environment (if you do not need online features), so that it can be applied to confidential scene.
- It shows Lawtext, standard law XML (both from local file and from e-LAWS API) as web page with some navigating features.
- Lawtext-app is accompanied with additional syntax analyzer and basic semantic analyzer of law text. For example, it shows corresponding parentheses and nesting depth. It also shows term definition positions.
- It can emit Microsoft Word document (.docx) as well as Lawtext and standard law XML of displayed law.



Screenshots / スクリーンショット
========================

Lawtext-app
--------------------------------

.. image:: https://github.com/yamachig/Lawtext/wiki/images/app-screenshot1.png
    :target: https://github.com/yamachig/Lawtext/wiki/images/app-screenshot1.png

.. image:: https://github.com/yamachig/Lawtext/wiki/images/app-screenshot2.png
    :target: https://github.com/yamachig/Lawtext/wiki/images/app-screenshot2.png

VSCode extension / VSCode拡張機能
--------------------------------

.. image:: https://github.com/yamachig/Lawtext/wiki/images/vscode-screenshot1.png
    :target: https://github.com/yamachig/Lawtext/wiki/images/vscode-screenshot1.png

.. image:: https://github.com/yamachig/Lawtext/wiki/images/vscode-screenshot2.png
    :target: https://github.com/yamachig/Lawtext/wiki/images/vscode-screenshot2.png

.. image:: https://github.com/yamachig/Lawtext/wiki/images/vscode-screenshot3.png
    :target: https://github.com/yamachig/Lawtext/wiki/images/vscode-screenshot3.png



Example of Lawtext file / Lawtextファイルの例
========================

.. sourcecode :: none

    行政手続法
    （平成五年法律第八十八号）

    目次
      第一章　総則（第一条―第四条）
      第二章　申請に対する処分（第五条―第十一条）
      第三章　不利益処分
        第一節　通則（第十二条―第十四条）
        第二節　聴聞（第十五条―第二十八条）
        第三節　弁明の機会の付与（第二十九条―第三十一条）
      第四章　行政指導（第三十二条―第三十六条の二）
      第四章の二　処分等の求め（第三十六条の三）
      第五章　届出（第三十七条）
      第六章　意見公募手続等（第三十八条―第四十五条）
      第七章　補則（第四十六条）
      附則

          第一章　総則

      （目的等）
    第一条　この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。
    ２　処分、行政指導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項について、他の法律に特別の定めがある場合は、その定めるところによる。

      （定義）
    第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
      一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。
      二　処分　行政庁の処分その他公権力の行使に当たる行為をいう。
      三　申請　法令に基づき、行政庁の許可、認可、免許その他の自己に対し何らかの利益を付与する処分（以下「許認可等」という。）を求める行為であって、当該行為に対して行政庁が諾否の応答をすべきこととされているものをいう。
      四　不利益処分　行政庁が、法令に基づき、特定の者を名あて人として、直接に、これに義務を課し、又はその権利を制限する処分をいう。ただし、次のいずれかに該当するものを除く。
        イ　事実上の行為及び事実上の行為をするに当たりその範囲、時期等を明らかにするために法令上必要とされている手続としての処分
        ロ　申請により求められた許認可等を拒否する処分その他申請に基づき当該申請をした者を名あて人としてされる処分
        ハ　名あて人となるべき者の同意の下にすることとされている処分
        ニ　許認可等の効力を失わせる処分であって、当該許認可等の基礎となった事実が消滅した旨の届出があったことを理由としてされるもの
      五　行政機関　次に掲げる機関をいう。
        イ　法律の規定に基づき内閣に置かれる機関若しくは内閣の所轄の下に置かれる機関、宮内庁、内閣府設置法（平成十一年法律第八十九号）第四十九条第一項若しくは第二項に規定する機関、国家行政組織法（昭和二十三年法律第百二十号）第三条第二項に規定する機関、会計検査院若しくはこれらに置かれる機関又はこれらの機関の職員であって法律上独立に権限を行使することを認められた職員
        ロ　地方公共団体の機関（議会を除く。）
      六　行政指導　行政機関がその任務又は所掌事務の範囲内において一定の行政目的を実現するため特定の者に一定の作為又は不作為を求める指導、勧告、助言その他の行為であって処分に該当しないものをいう。
      七　届出　行政庁に対し一定の事項の通知をする行為（申請に該当するものを除く。）であって、法令により直接に当該通知が義務付けられているもの（自己の期待する一定の法律上の効果を発生させるためには当該通知をすべきこととされているものを含む。）をいう。
      八　命令等　内閣又は行政機関が定める次に掲げるものをいう。
        イ　法律に基づく命令（処分の要件を定める告示を含む。次条第二項において単に「命令」という。）又は規則
        ロ　審査基準（申請により求められた許認可等をするかどうかをその法令の定めに従って判断するために必要とされる基準をいう。以下同じ。）
        ハ　処分基準（不利益処分をするかどうか又はどのような不利益処分とするかについてその法令の定めに従って判断するために必要とされる基準をいう。以下同じ。）
        ニ　行政指導指針（同一の行政目的を実現するため一定の条件に該当する複数の者に対し行政指導をしようとするときにこれらの行政指導に共通してその内容となるべき事項をいう。以下同じ。）

