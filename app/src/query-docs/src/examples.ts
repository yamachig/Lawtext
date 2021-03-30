//[md]<!--
import { lawtext } from "@appsrc/globals";
//[md]-->

//[md]<!--
void (async () => {
//[md]-->

    //[md]### 法令番号が正規表現 `/^平成.{1,3}年法律/` にマッチする法令の法令番号と法令名を、順不同で10件表示
    //[md]```ts
    lawtext
        .queryViaAPI({ LawNum: /^平成.{1,3}年法律/ })
        .limit(10)
        .toArray()
        .then(a => console.table(a, ["LawNum", "LawTitle"]));
    //[md]```

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

//[md]<!--
});
//[md]-->
