import { testLawtextToStd } from "../testHelper";
import $amendProvision, { amendProvisionToLines } from "./$amendProvision";
import $article, { articleToLines } from "./$article";

describe("Test $amendProvision and amendProvisionToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
  （国立研究開発法人海洋研究開発機構法の一部改正）

第十三条　国立研究開発法人海洋研究開発機構法（平成十五年法律第九十五号）の一部を次のように改正する。

  目次中「・第十八条」を「―第十八条」に改める。

  第十七条の次に次の一条を加える。

      （株式等の取得及び保有）
    第十七条の二　機構は、科学技術・イノベーション創出の活性化に関する法律（平成二十年法律第六十三号）第三十四条の五第一項及び第二項の規定による株式又は新株予約権の取得及び保有を行うことができる。
  第十八条第一項中「前条」を「第十七条」に改める。

  （国立研究開発法人日本原子力研究開発機構法の一部改正）
第十四条　国立研究開発法人日本原子力研究開発機構法（平成十六年法律第百五十五号）の一部を次のように改正する。
`.replace(/\r?\n/g, "\r\n");
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
  （国立研究開発法人海洋研究開発機構法の一部改正）
第十三条　国立研究開発法人海洋研究開発機構法（平成十五年法律第九十五号）の一部を次のように改正する。
  目次中「・第十八条」を「―第十八条」に改める。
  第十七条の次に次の一条を加える。
      （株式等の取得及び保有）
    第十七条の二　機構は、科学技術・イノベーション創出の活性化に関する法律（平成二十年法律第六十三号）第三十四条の五第一項及び第二項の規定による株式又は新株予約権の取得及び保有を行うことができる。
  第十八条第一項中「前条」を「第十七条」に改める。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Article",
            attr: {
                Delete: "false",
                Hide: "false"
            },
            children: [
                {
                    tag: "ArticleCaption",
                    attr: {},
                    children: ["（国立研究開発法人海洋研究開発機構法の一部改正）"]
                },
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: ["第十三条"]
                },
                {
                    tag: "Paragraph",
                    attr: {},
                    children: [
                        {
                            tag: "ParagraphNum",
                            attr: {},
                            children: []
                        },
                        {
                            tag: "ParagraphSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["国立研究開発法人海洋研究開発機構法（平成十五年法律第九十五号）の一部を次のように改正する。"]
                                }
                            ]
                        },
                        {
                            tag: "AmendProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "AmendProvisionSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["目次中「・第十八条」を「―第十八条」に改める。"]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            tag: "AmendProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "AmendProvisionSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["第十七条の次に次の一条を加える。"]
                                        }
                                    ]
                                },
                                {
                                    tag: "NewProvision",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Article",
                                            attr: {
                                                Delete: "false",
                                                Hide: "false"
                                            },
                                            children: [
                                                {
                                                    tag: "ArticleCaption",
                                                    attr: {},
                                                    children: ["（株式等の取得及び保有）"]
                                                },
                                                {
                                                    tag: "ArticleTitle",
                                                    attr: {},
                                                    children: ["第十七条の二"]
                                                },
                                                {
                                                    tag: "Paragraph",
                                                    attr: {},
                                                    children: [
                                                        {
                                                            tag: "ParagraphNum",
                                                            attr: {},
                                                            children: []
                                                        },
                                                        {
                                                            tag: "ParagraphSentence",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["機構は、科学技術・イノベーション創出の活性化に関する法律（平成二十年法律第六十三号）第三十四条の五第一項及び第二項の規定による株式又は新株予約権の取得及び保有を行うことができる。"]
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
                        },
                        {
                            tag: "AmendProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "AmendProvisionSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["第十八条第一項中「前条」を「第十七条」に改める。"]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $article.match(0, vlines, env);
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => articleToLines(el, []),
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
  （地方整備局組織規則の一部改正）
第四条　地方整備局組織規則（平成十三年国土交通省令第二十一号）の一部を次のように改正する。
  次の表により、改正前欄に掲げる規定の傍線を付した部分をこれに対応する改正後欄に掲げる規定の傍線を付した部分のように改め、改正前欄に掲げるその標記部分に二重傍線を付した規定で改正後欄にこれに対応するものを掲げていないものは、これを削る。

    <Fig src="./pict/001.jpg"/>

  （北海道開発局組織規則の一部改正）
第五条　北海道開発局組織規則（平成十三年国土交通省令第二十二号）の一部を次のように改正する。
`.replace(/\r?\n/g, "\r\n");
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
  （地方整備局組織規則の一部改正）
第四条　地方整備局組織規則（平成十三年国土交通省令第二十一号）の一部を次のように改正する。
  次の表により、改正前欄に掲げる規定の傍線を付した部分をこれに対応する改正後欄に掲げる規定の傍線を付した部分のように改め、改正前欄に掲げるその標記部分に二重傍線を付した規定で改正後欄にこれに対応するものを掲げていないものは、これを削る。

    <Fig src="./pict/001.jpg"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Article",
            attr: {
                Delete: "false",
                Hide: "false"
            },
            children: [
                {
                    tag: "ArticleCaption",
                    attr: {},
                    children: ["（地方整備局組織規則の一部改正）"]
                },
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: ["第四条"]
                },
                {
                    tag: "Paragraph",
                    attr: {},
                    children: [
                        {
                            tag: "ParagraphNum",
                            attr: {},
                            children: []
                        },
                        {
                            tag: "ParagraphSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["地方整備局組織規則（平成十三年国土交通省令第二十一号）の一部を次のように改正する。"]
                                }
                            ]
                        },
                        {
                            tag: "AmendProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "AmendProvisionSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["次の表により、改正前欄に掲げる規定の傍線を付した部分をこれに対応する改正後欄に掲げる規定の傍線を付した部分のように改め、改正前欄に掲げるその標記部分に二重傍線を付した規定で改正後欄にこれに対応するものを掲げていないものは、これを削る。"]
                                        }
                                    ]
                                },
                                {
                                    tag: "NewProvision",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "FigStruct",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Fig",
                                                    attr: {
                                                        src: "./pict/001.jpg"
                                                    },
                                                    children: []
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                    ]
                }
            ]
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $article.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = articleToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
  （沖縄振興特別措置法の一部改正）
第十条　沖縄振興特別措置法（平成十四年法律第十四号）の一部を次のように改正する。
  第六十六条の見出しを「（中小企業等経営強化法の特例）」に改め、同条第一項中「中小企業の新たな事業活動の促進に関する法律第二条第六項」を「中小企業等経営強化法第二条第七項」に、「第二条第四項」を「第二条第五項」に改め、同条第五項中「中小企業の新たな事業活動の促進に関する法律」を「中小企業等経営強化法」に改め、同項の表第九条第一項の項を次のように改める。

    * - 第八条第一項
      - 中小企業者及び組合等が
      - 特定中小企業者等が

  （北海道開発局組織規則の一部改正）
第五条　北海道開発局組織規則（平成十三年国土交通省令第二十二号）の一部を次のように改正する。
`.replace(/\r?\n/g, "\r\n");
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
  （沖縄振興特別措置法の一部改正）
第十条　沖縄振興特別措置法（平成十四年法律第十四号）の一部を次のように改正する。
  第六十六条の見出しを「（中小企業等経営強化法の特例）」に改め、同条第一項中「中小企業の新たな事業活動の促進に関する法律第二条第六項」を「中小企業等経営強化法第二条第七項」に、「第二条第四項」を「第二条第五項」に改め、同条第五項中「中小企業の新たな事業活動の促進に関する法律」を「中小企業等経営強化法」に改め、同項の表第九条第一項の項を次のように改める。

    * - 第八条第一項
      - 中小企業者及び組合等が
      - 特定中小企業者等が
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Article",
            attr: {
                Delete: "false",
                Hide: "false"
            },
            children: [
                {
                    tag: "ArticleCaption",
                    attr: {},
                    children: ["（沖縄振興特別措置法の一部改正）"]
                },
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: ["第十条"]
                },
                {
                    tag: "Paragraph",
                    attr: {},
                    children: [
                        {
                            tag: "ParagraphNum",
                            attr: {},
                            children: []
                        },
                        {
                            tag: "ParagraphSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["沖縄振興特別措置法（平成十四年法律第十四号）の一部を次のように改正する。"]
                                }
                            ]
                        },
                        {
                            tag: "AmendProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "AmendProvisionSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["第六十六条の見出しを「（中小企業等経営強化法の特例）」に改め、同条第一項中「中小企業の新たな事業活動の促進に関する法律第二条第六項」を「中小企業等経営強化法第二条第七項」に、「第二条第四項」を「第二条第五項」に改め、同条第五項中「中小企業の新たな事業活動の促進に関する法律」を「中小企業等経営強化法」に改め、同項の表第九条第一項の項を次のように改める。"]
                                        }
                                    ]
                                },
                                {
                                    tag: "NewProvision",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "TableStruct",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Table",
                                                    attr: {},
                                                    children: [
                                                        {
                                                            tag: "TableRow",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "TableColumn",
                                                                    attr: {},
                                                                    children: [
                                                                        {
                                                                            tag: "Sentence",
                                                                            attr: {},
                                                                            children: ["第八条第一項"]
                                                                        }
                                                                    ]
                                                                },
                                                                {
                                                                    tag: "TableColumn",
                                                                    attr: {},
                                                                    children: [
                                                                        {
                                                                            tag: "Sentence",
                                                                            attr: {},
                                                                            children: ["中小企業者及び組合等が"]
                                                                        }
                                                                    ]
                                                                },
                                                                {
                                                                    tag: "TableColumn",
                                                                    attr: {},
                                                                    children: [
                                                                        {
                                                                            tag: "Sentence",
                                                                            attr: {},
                                                                            children: ["特定中小企業者等が"]
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
            ]
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $article.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = articleToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
第二章の章名を次のように改める。
  <ChapterTitle>第二章　肉用牛及び肉豚についての交付金の交付</ChapterTitle>

  （北海道開発局組織規則の一部改正）
第五条　北海道開発局組織規則（平成十三年国土交通省令第二十二号）の一部を次のように改正する。
`.replace(/\r?\n/g, "\r\n");
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
第二章の章名を次のように改める。
  <ChapterTitle>第二章　肉用牛及び肉豚についての交付金の交付</ChapterTitle>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AmendProvision",
            attr: {},
            children: [
                {
                    tag: "AmendProvisionSentence",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: ["第二章の章名を次のように改める。"]
                        }
                    ]
                },
                {
                    tag: "NewProvision",
                    attr: {},
                    children: [
                        {
                            tag: "ChapterTitle",
                            attr: {},
                            children: ["第二章　肉用牛及び肉豚についての交付金の交付"]
                        }
                    ]
                }
            ]
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $amendProvision.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = amendProvisionToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
第三章を第五章とし、第二章の次に次の二章を加える。
  :keep-indents:第三章　加工原料乳についての生産者補給交付金等の交付

  :keep-indents:第一節　生産者補給交付金等の交付
    （生産者補給交付金等の交付）
  第十一条　機構は、次の各号に掲げる対象事業を行う対象事業者に対し、この節に定めるところにより、当該各号に定める生産者補給交付金又は生産者補給金（以下「生産者補給交付金等」という。）を交付することができる。

  （北海道開発局組織規則の一部改正）
第五条　北海道開発局組織規則（平成十三年国土交通省令第二十二号）の一部を次のように改正する。
`.replace(/\r?\n/g, "\r\n");
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
第三章を第五章とし、第二章の次に次の二章を加える。

  :keep-indents:第三章　加工原料乳についての生産者補給交付金等の交付

  :keep-indents:第一節　生産者補給交付金等の交付

    （生産者補給交付金等の交付）
  第十一条　機構は、次の各号に掲げる対象事業を行う対象事業者に対し、この節に定めるところにより、当該各号に定める生産者補給交付金又は生産者補給金（以下「生産者補給交付金等」という。）を交付することができる。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AmendProvision",
            attr: {},
            children: [
                {
                    tag: "AmendProvisionSentence",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: ["第三章を第五章とし、第二章の次に次の二章を加える。"]
                        }
                    ]
                },
                {
                    tag: "NewProvision",
                    attr: {},
                    children: [
                        {
                            tag: "Chapter",
                            attr: {
                                Delete: "false",
                                Hide: "false",
                                Num: "3"
                            },
                            children: [
                                {
                                    tag: "ChapterTitle",
                                    attr: {},
                                    children: ["第三章　加工原料乳についての生産者補給交付金等の交付"]
                                },
                                {
                                    tag: "Section",
                                    attr: {
                                        Delete: "false",
                                        Hide: "false",
                                        Num: "1"
                                    },
                                    children: [
                                        {
                                            tag: "SectionTitle",
                                            attr: {},
                                            children: ["第一節　生産者補給交付金等の交付"]
                                        },
                                        {
                                            tag: "Article",
                                            attr: {
                                                Delete: "false",
                                                Hide: "false"
                                            },
                                            children: [
                                                {
                                                    tag: "ArticleCaption",
                                                    attr: {},
                                                    children: ["（生産者補給交付金等の交付）"]
                                                },
                                                {
                                                    tag: "ArticleTitle",
                                                    attr: {},
                                                    children: ["第十一条"]
                                                },
                                                {
                                                    tag: "Paragraph",
                                                    attr: {},
                                                    children: [
                                                        {
                                                            tag: "ParagraphNum",
                                                            attr: {},
                                                            children: []
                                                        },
                                                        {
                                                            tag: "ParagraphSentence",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["機構は、次の各号に掲げる対象事業を行う対象事業者に対し、この節に定めるところにより、当該各号に定める生産者補給交付金又は生産者補給金（以下「生産者補給交付金等」という。）を交付することができる。"]
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
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $amendProvision.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = amendProvisionToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});
