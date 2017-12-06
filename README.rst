========================
Lawtext
========================

**Lawtext** is a plain text format for Japanese law.

Lawtext makes easy to manage law documents utilizing numerous freely available tools for source code management. For example:

    - **Editing with usual text editors** such as notepad. You don't need special editing apps.
    - **Version vontrol with common VCS** such as
      `Git <https://git-scm.com/>`__ and
      `Mercurial <https://www.mercurial-scm.org/>`__\ , etc.
      `Sample <https://github.com/yamachig/Lawtext-sample-Administrative-Procedure-Act/commits>`__
    - **Comparing between versions and making patchs**\ , using diff, VCS host such as
      `GitHub <https://github.com/>`__ and
      `Bitbucket <https://bitbucket.org/>`__\ , or code editor like
      `Visual Studio Code <https://code.visualstudio.com/>`__\ .
      `Sample <https://github.com/yamachig/Lawtext-sample-Administrative-Procedure-Act/commits>`__

Lawtext (\*.law.txt) can be converted from `Japanese Standard Law XML <http://search.e-gov.go.jp/servlet/Public?CLASSNAME=PCMMSTDETAIL&id=145208896&Mode=2>`__ (\*.xml), to Word document (\*.docx), to Web page (\*.html), and to Japanese Standard Law XML again.

- Try it: https://yamachig.github.io/lawtext-app/
- Download offline version: https://github.com/yamachig/lawtext-app/blob/master/app.zip?raw=true

------------

**Lawtext** は、日本の法令をプレーンテキストで記述するためのフォーマットです。

Lawtextを用いることで、無償で提供されている数多くのソースコード管理ツールを活用することができるようになり、法令文書の管理が容易になります。例えば：

    - **普通のテキストエディタ**\ （メモ帳など）\ **を用いた編集**\ 。特殊な編集ソフトは必要ありません。
    - **一般的なバージョン管理システム**\ （\ `Git <https://git-scm.com/>`__ や `Mercurial <https://www.mercurial-scm.org/>`__ など）\ **を用いたバージョン管理**\ 。
      `サンプル <https://github.com/yamachig/Lawtext-sample-Administrative-Procedure-Act/commits>`__
    - diffやバージョン管理ホスティングサービス（\ `GitHub <https://github.com/>`__ や
      `Bitbucket <https://bitbucket.org/>`__ など）、ソースコードエディタ（\ `Visual Studio Code <https://code.visualstudio.com/>`__ など）を用いた\ **バージョン間比較と差分の生成**\ 。
      `サンプル <https://github.com/yamachig/Lawtext-sample-Administrative-Procedure-Act/commits>`__

Lawtext (\*.law.txt) は `法令標準XML <http://search.e-gov.go.jp/servlet/Public?CLASSNAME=PCMMSTDETAIL&id=145208896&Mode=2>`__ (\*.xml) から変換することができ、また、Wordファイル（\*.docx）、Webページ（\*.html）、法令標準XMLへ変換することができます。

- こちらからお試しください: https://yamachig.github.io/lawtext-app/
- オフライン版をダウンロード: https://github.com/yamachig/lawtext-app/blob/master/app.zip?raw=true

------------

Example 例
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

