/* //[md-ignore]
Lawtext query の使用方法
====================================================

Lawtext query は、ブラウザのコンソールとjavascriptを利用した高度な検索機能です。Lawtext query を使用すると、法令XMLの構造や正規表現を利用した法令検索ができます。

## Lawtext query の使用方法

1. Lawtextの画面でブラウザのコンソールを開きます。

    - [Google Chrome の場合](https://developer.chrome.com/docs/devtools/open/#console)（Windowsなど: Ctrl+Shift+J, Mac: Cmd+Option+J）

    - [Firefox の場合](https://developer.mozilla.org/docs/Tools/Web_Console/UI_Tour)（Windowsなど: Ctrl+Shift+K,Mac: Cmd+Option+K）

2. コンソールに Lawtext query を使用する javascriptコードを入力して実行します。（[コードの例](#examples)）

## 検索に用いるデータの取得元

Lawtext query の検索に用いるデータは、e-Gov 法令API とオフライン用データの2種類のどちらかを選択します。

- **e-Gov 法令API**: {@link lawtext.queryViaAPI | lawtext.queryViaAPI()} を使用した場合は、e-Gov法令APIからデータを取得します。e-Gov 法令APIにアクセスできる環境があれば事前の準備なく利用できます。ただし、データをインターネット経由で毎回取得するため、実行に時間がかかる場合があります。

- **オフライン用データ**: {@link lawtext.query | lawtext.query()} を使用した場合は、オフライン用データを利用します。ダウンロード版Lawtextでオフライン用データを保存している場合に使用できます。多くの場合、e-Gov 法令APIを使用する方法よりも高速です。

## Lawtext query リファレンス

- 法令の検索条件について: {@link coreQuery.LawCriteriaArgs}
- 検索結果の制御について: {@link coreQuery.Query}, {@link coreQuery.LawQuery}
- ブラウザのコンソールから利用できる {@link lawtext} オブジェクトについて: {@link lawtext}

<a name="examples"></a>

## Lawtext query のコード例

*/ //[md-ignore]

import { lawtext } from "@appsrc/globals"; //[md-ignore]

void (async () => { //[md-ignore]

    //[md]### 法令番号が正規表現 `/^平成.{1,3}年法律/` にマッチする法令の法令番号と法令名を、順不同で10件表示
    //[md]```ts
    lawtext
        .queryViaAPI({ LawNum: /^平成.{1,3}年法律/ })
        .limit(10)
        .toArray()
        .then(a => console.table(a, ["LawNum", "LawTitle"]));
    //[md]```

}); //[md-ignore]

void (async () => { //[md-ignore]

    //[md]### &lt;EnactStatement&gt;タグを含む法律を順不同で10件検索し、見つかり次第タグの内容を出力
    //[md][.assignDocument()](classes/coreQuery.LawQuery.html#assignDocument) によりXMLのDOMを順次取得するため時間がかかります。
    //[md]```ts
    lawtext
        .queryViaAPI({ LawNum: /^.{3,5}年法律/ })
        .assignDocument()
        .assign(law => ({
            els: Array.from(law.document.getElementsByTagName("EnactStatement")),
        }))
        .filter(law => law.els.length > 0)
        .limit(10)
        .forEach(law => {
            console.group(`📘 ${law.LawTitle}（${law.LawNum}）`);
            for (const el of law.els) {
                console.log(el.outerHTML);
            }
            console.log(lawtext.getLawtextAppUrl(law));
            console.groupEnd();
        })
        .then(() => "✓ completed.");
    //[md]```

}); //[md-ignore]

void (async () => { //[md-ignore]

    //[md]### &lt;Fig&gt;タグを含む政令を順不同で10件検索し、見つかり次第法令内の位置を出力
    //[md][.assignDocument()](classes/coreQuery.LawQuery.html#assignDocument) によりXMLのDOMを順次取得するため時間がかかります。
    //[md]```ts
    lawtext
        .queryViaAPI({ LawNum: /政令/ })
        .assignDocument()
        .assign(law => ({
            els: Array.from(law.document.getElementsByTagName("Fig")),
        }))
        .filter(law => law.els.length > 0)
        .limit(10)
        .forEach(law => {
            console.group(`📘 ${law.LawTitle}（${law.LawNum}）`);
            for (const el of law.els) {
                console.log(lawtext.traceTitles(el));
            }
            console.log(lawtext.getLawtextAppUrl(law));
            console.groupEnd();
        })
        .then(() => "✓ completed.");
    //[md]```

}); //[md-ignore]

void (async () => { //[md-ignore]

    //[md]### 正規表現 `/の意[義味].*に定めるところによる/` にマッチする文を含む本文タグを検索し、タグ内の文言が重複しないものを見つかり次第10件まで出力（途中経過を表示しない）
    //[md][.assignDocument()](classes/coreQuery.LawQuery.html#assignDocument) によりXMLのDOMを順次取得するため時間がかかります。
    //[md]```ts
    (async () => {
        const set = new Set()/*[md-ignore-start]*/as Set<string>/*[md-ignore-end]*/;
        return lawtext
            .queryViaAPI()
            .assignDocument()
            .while(() => set.size < 10)
            .forEach(law => {
                for (const tag of lawtext.lawUtil.paragraphItemSentenceTags) {
                    for (const el of Array.from(law.document.getElementsByTagName(tag))) {
                        const text = (el.textContent ?? "").trim();
                        if (/の意[義味].*に定めるところによる/.exec(text) && !set.has(text)) {
                            console.group(`【${law.LawTitle}（${law.LawNum}）${lawtext.traceTitles(el).join("/")}】`);
                            console.log(`%c${text}`, "color: navy;");
                            console.log(lawtext.getLawtextAppUrl(law));
                            console.groupEnd();
                            set.add(text);
                        }
                    }
                }
            })
            .then(() => "✓ completed.");
    })();
    //[md]```

}); //[md-ignore]

void (async () => { //[md-ignore]

    //[md]### 項番号がなくOldNum属性がtrueでない2以上の項のみからなる条を含む法律を順不同で10件検索し、見つかり次第条のタグの内容を出力
    //[md][.assignDocument()](classes/coreQuery.LawQuery.html#assignDocument) によりXMLのDOMを順次取得するため時間がかかります。
    //[md]```ts
    lawtext
        .queryViaAPI({ LawNum: /^.{3,5}年法律/ })
        .assignDocument()
        .assign(law => {
            const articles = Array.from(law.document.getElementsByTagName("Article"));
            const noNumPhsArticles = [];
            for (const article of articles) {
                const paragraphs = Array.from(article.querySelectorAll(":scope > Paragraph"));
                if (paragraphs.length >= 2 && paragraphs.every(p => {
                    const num = p.querySelector(":scope > ParagraphNum");
                    return p.getAttribute("OldNum") !== "true" && (!num || !num.innerHTML);
                })) noNumPhsArticles.push(article);
            }
            return { noNumPhsArticles };
        })
        .filter(law => law.noNumPhsArticles.length > 0)
        .limit(10)
        .forEach(law => {
            console.group(`📘 ${law.LawTitle}（${law.LawNum}）`);
            for (const article of law.noNumPhsArticles) {
                console.log(article.outerHTML);
            }
            console.log(lawtext.getLawtextAppUrl(law));
            console.groupEnd();
        })
        .then(() => "✓ completed.");
    //[md]```

}); //[md-ignore]
