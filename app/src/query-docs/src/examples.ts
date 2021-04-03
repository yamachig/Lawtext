/* eslint-disable @typescript-eslint/ban-ts-comment */ //[md-ignore]

import * as lawtext from "@appsrc/globals/lawtext"; //[md-ignore]

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
    //[md]{@link LawQuery.assignDocument | .assignDocument()} によりXMLのDOMを順次取得するため時間がかかります。
    //[md]```ts
    lawtext
        .query({ LawNum: /^.{3,5}年法律/ })
        .assignDocument()
        .assign(law => ({
            els: Array.from(law.document.getElementsByTagName("EnactStatement")),
        }))
        .filter(law => law.els.length > 0)
        .limit(10)
        .forEach(law => {
            console.log(`📘 ${law.LawTitle}（${law.LawNum}）`);
            for (const el of law.els) {
                console.log(el.outerHTML);
            }
        });
    //[md]```

}); //[md-ignore]

void (async () => { //[md-ignore]

    //[md]### &lt;Fig&gt;タグを含む政令を順不同で10件検索し、見つかり次第法令内の位置を出力
    //[md]{@link LawQuery.assignDocument | .assignDocument()} によりXMLのDOMを順次取得するため時間がかかります。
    //[md]```ts
    lawtext
        .query({ LawNum: /政令/ })
        .assignDocument()
        .assign(law => ({
            els: Array.from(law.document.getElementsByTagName("Fig")),
        }))
        .filter(law => law.els.length > 0)
        .limit(10)
        .forEach(law => {
            console.log(`📘 ${law.LawTitle}（${law.LawNum}）`);
            for (const el of law.els) {
                console.log(lawtext.traceTitles(el));
            }
        });
    //[md]```

}); //[md-ignore]

void (async () => { //[md-ignore]

    //[md]### 正規表現 `/の意[義味].*に定めるところによる/` にマッチする文を含む本文タグを検索し、タグ内の文言が重複しないものを見つかり次第100件まで出力（途中経過を表示しない）
    //[md]{@link LawQuery.assignDocument | .assignDocument()} によりXMLのDOMを順次取得するため時間がかかります。
    //[md]```ts
    (() => {
        const set = new Set()/*[md-ignore-start]*/as Set<string>/*[md-ignore-end]*/;
        lawtext
            .query(null, { showProgress: false })
            .assignDocument()
            .while(() => set.size < 100)
            .forEach(law => {
                for (const tag of lawtext.coreUtil.paragraphItemSentenceTags) {
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
            }).then(() => "✓ completed.");
    })();
    //[md]```

}); //[md-ignore]
