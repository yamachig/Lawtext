import { testLawtextToStd } from "../testHelper";
import $law, { lawToLines } from "./$law";

describe("Test $law and lawToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
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


      附　則　（平成一一年一二月八日法律第一五一号）　抄

  （施行期日）
第一条　この法律は、平成十二年四月一日から施行する。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
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

      附　則　（平成一一年一二月八日法律第一五一号）　抄

  （施行期日）
第一条　この法律は、平成十二年四月一日から施行する。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Law",
            attr: {
                Era: "Heisei",
                Lang: "ja",
                LawType: "Act",
                Num: "88",
                Year: "5",
            },
            children: [
                {
                    tag: "LawNum",
                    attr: {},
                    children: ["平成五年法律第八十八号"]
                },
                {
                    tag: "LawBody",
                    attr: {},
                    children: [
                        {
                            tag: "LawTitle",
                            attr: {},
                            children: ["行政手続法"]
                        },
                        {
                            tag: "TOC",
                            attr: {},
                            children: [
                                {
                                    tag: "TOCLabel",
                                    attr: {},
                                    children: ["目次"]
                                },
                                {
                                    tag: "TOCChapter",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "ChapterTitle",
                                            attr: {},
                                            children: ["第一章　総則"]
                                        },
                                        {
                                            tag: "ArticleRange",
                                            attr: {},
                                            children: ["（第一条―第四条）"]
                                        }
                                    ]
                                },
                                {
                                    tag: "TOCChapter",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "ChapterTitle",
                                            attr: {},
                                            children: ["第二章　申請に対する処分"]
                                        },
                                        {
                                            tag: "ArticleRange",
                                            attr: {},
                                            children: ["（第五条―第十一条）"]
                                        }
                                    ]
                                },
                                {
                                    tag: "TOCChapter",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "ChapterTitle",
                                            attr: {},
                                            children: ["第三章　不利益処分"]
                                        },
                                        {
                                            tag: "TOCSection",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "SectionTitle",
                                                    attr: {},
                                                    children: ["第一節　通則"]
                                                },
                                                {
                                                    tag: "ArticleRange",
                                                    attr: {},
                                                    children: ["（第十二条―第十四条）"]
                                                }
                                            ]
                                        },
                                        {
                                            tag: "TOCSection",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "SectionTitle",
                                                    attr: {},
                                                    children: ["第二節　聴聞"]
                                                },
                                                {
                                                    tag: "ArticleRange",
                                                    attr: {},
                                                    children: ["（第十五条―第二十八条）"]
                                                }
                                            ]
                                        },
                                        {
                                            tag: "TOCSection",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "SectionTitle",
                                                    attr: {},
                                                    children: ["第三節　弁明の機会の付与"]
                                                },
                                                {
                                                    tag: "ArticleRange",
                                                    attr: {},
                                                    children: ["（第二十九条―第三十一条）"]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    tag: "TOCChapter",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "ChapterTitle",
                                            attr: {},
                                            children: ["第四章　行政指導"]
                                        },
                                        {
                                            tag: "ArticleRange",
                                            attr: {},
                                            children: ["（第三十二条―第三十六条の二）"]
                                        }
                                    ]
                                },
                                {
                                    tag: "TOCChapter",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "ChapterTitle",
                                            attr: {},
                                            children: ["第四章の二　処分等の求め"]
                                        },
                                        {
                                            tag: "ArticleRange",
                                            attr: {},
                                            children: ["（第三十六条の三）"]
                                        }
                                    ]
                                },
                                {
                                    tag: "TOCChapter",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "ChapterTitle",
                                            attr: {},
                                            children: ["第五章　届出"]
                                        },
                                        {
                                            tag: "ArticleRange",
                                            attr: {},
                                            children: ["（第三十七条）"]
                                        }
                                    ]
                                },
                                {
                                    tag: "TOCChapter",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "ChapterTitle",
                                            attr: {},
                                            children: ["第六章　意見公募手続等"]
                                        },
                                        {
                                            tag: "ArticleRange",
                                            attr: {},
                                            children: ["（第三十八条―第四十五条）"]
                                        }
                                    ]
                                },
                                {
                                    tag: "TOCChapter",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "ChapterTitle",
                                            attr: {},
                                            children: ["第七章　補則"]
                                        },
                                        {
                                            tag: "ArticleRange",
                                            attr: {},
                                            children: ["（第四十六条）"]
                                        }
                                    ]
                                },
                                {
                                    tag: "TOCSupplProvision",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "SupplProvisionLabel",
                                            attr: {},
                                            children: ["附則"]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            tag: "MainProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "Chapter",
                                    attr: { Num: "1"
                                    },
                                    children: [
                                        {
                                            tag: "ChapterTitle",
                                            attr: {},
                                            children: ["第一章　総則"]
                                        },
                                        {
                                            tag: "Article",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "ArticleCaption",
                                                    attr: {},
                                                    children: ["（目的等）"]
                                                },
                                                {
                                                    tag: "ArticleTitle",
                                                    attr: {},
                                                    children: ["第一条"]
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
                                                                    children: ["この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。"]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },
                                                {
                                                    tag: "Paragraph",
                                                    attr: {},
                                                    children: [
                                                        {
                                                            tag: "ParagraphNum",
                                                            attr: {},
                                                            children: ["２"]
                                                        },
                                                        {
                                                            tag: "ParagraphSentence",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["処分、行政指導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項について、他の法律に特別の定めがある場合は、その定めるところによる。"]
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
                            tag: "SupplProvision",
                            attr: {
                                AmendLawNum: "平成一一年一二月八日法律第一五一号",
                                Extract: "true"
                            },
                            children: [
                                {
                                    tag: "SupplProvisionLabel",
                                    attr: {},
                                    children: ["附　則"]
                                },
                                {
                                    tag: "Article",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "ArticleCaption",
                                            attr: {},
                                            children: ["（施行期日）"]
                                        },
                                        {
                                            tag: "ArticleTitle",
                                            attr: {},
                                            children: ["第一条"]
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
                                                            children: ["この法律は、平成十二年四月一日から施行する。"]
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
                const result = $law.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = lawToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
平成十四年度における国民年金法による年金の額等の改定の特例に関する法律
（平成十四年法律第二十一号）

平成十四年四月から平成十五年三月までの月分の次の表の上欄に掲げる額については、同表の下欄に掲げる規定（他の法令において、引用し、準用し、又はその例による場合を含む。）にかかわらず、これらの規定による平成十年の年平均の物価指数（従前の総務庁において作成した全国消費者物価指数をいう。）に対する平成十三年の年平均の物価指数（総務省において作成する全国消費者物価指数をいう。）の比率を基準とする改定は、行わない。

  * - [BorderBottom="solid"][BorderLeft="solid"][BorderRight="solid"][BorderTop="solid"]国民年金法（昭和三十四年法律第百四十一号）による年金たる給付（付加年金を除く。）の額
    - [BorderBottom="solid"][BorderLeft="solid"][BorderRight="solid"][BorderTop="solid"]国民年金法第十六条の二
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
平成十四年度における国民年金法による年金の額等の改定の特例に関する法律
（平成十四年法律第二十一号）

平成十四年四月から平成十五年三月までの月分の次の表の上欄に掲げる額については、同表の下欄に掲げる規定（他の法令において、引用し、準用し、又はその例による場合を含む。）にかかわらず、これらの規定による平成十年の年平均の物価指数（従前の総務庁において作成した全国消費者物価指数をいう。）に対する平成十三年の年平均の物価指数（総務省において作成する全国消費者物価指数をいう。）の比率を基準とする改定は、行わない。

  * - 国民年金法（昭和三十四年法律第百四十一号）による年金たる給付（付加年金を除く。）の額
    - 国民年金法第十六条の二
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Law",
            attr: {
                Lang: "ja",
                Era: "Heisei",
                Year: "14",
                LawType: "Act",
                Num: "21"
            },
            children: [
                {
                    tag: "LawNum",
                    attr: {},
                    children: ["平成十四年法律第二十一号"]
                },
                {
                    tag: "LawBody",
                    attr: {},
                    children: [
                        {
                            tag: "LawTitle",
                            attr: {},
                            children: ["平成十四年度における国民年金法による年金の額等の改定の特例に関する法律"]
                        },
                        {
                            tag: "MainProvision",
                            attr: {},
                            children: [
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
                                                    children: ["平成十四年四月から平成十五年三月までの月分の次の表の上欄に掲げる額については、同表の下欄に掲げる規定（他の法令において、引用し、準用し、又はその例による場合を含む。）にかかわらず、これらの規定による平成十年の年平均の物価指数（従前の総務庁において作成した全国消費者物価指数をいう。）に対する平成十三年の年平均の物価指数（総務省において作成する全国消費者物価指数をいう。）の比率を基準とする改定は、行わない。"]
                                                }
                                            ]
                                        },
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
                                                                    attr: {
                                                                        BorderBottom: "solid",
                                                                        BorderLeft: "solid",
                                                                        BorderRight: "solid",
                                                                        BorderTop: "solid"
                                                                    },
                                                                    children: [
                                                                        {
                                                                            tag: "Sentence",
                                                                            attr: {},
                                                                            children: ["国民年金法（昭和三十四年法律第百四十一号）による年金たる給付（付加年金を除く。）の額"]
                                                                        }
                                                                    ]
                                                                },
                                                                {
                                                                    tag: "TableColumn",
                                                                    attr: {
                                                                        BorderBottom: "solid",
                                                                        BorderLeft: "solid",
                                                                        BorderRight: "solid",
                                                                        BorderTop: "solid"
                                                                    },
                                                                    children: [
                                                                        {
                                                                            tag: "Sentence",
                                                                            attr: {},
                                                                            children: ["国民年金法第十六条の二"]
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
                const result = $law.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = lawToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
民法
（明治二十九年法律第八十九号）

:enact-statement:民法第一編第二編第三編別冊ノ通定ム

:enact-statement:此法律施行ノ期日ハ勅令ヲ以テ之ヲ定ム

:enact-statement:明治二十三年法律第二十八号民法財産編財産取得編債権担保編証拠編ハ此法律発布ノ日ヨリ廃止ス

:enact-statement:（別冊）

第一条　私権は、公共の福祉に適合しなければならない。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
民法
（明治二十九年法律第八十九号）

:enact-statement:民法第一編第二編第三編別冊ノ通定ム

:enact-statement:此法律施行ノ期日ハ勅令ヲ以テ之ヲ定ム

:enact-statement:明治二十三年法律第二十八号民法財産編財産取得編債権担保編証拠編ハ此法律発布ノ日ヨリ廃止ス

:enact-statement:（別冊）

第一条　私権は、公共の福祉に適合しなければならない。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Law",
            attr: {
                Lang: "ja",
                Era: "Meiji",
                Year: "29",
                LawType: "Act",
                Num: "89"
            },
            children: [
                {
                    tag: "LawNum",
                    attr: {},
                    children: ["明治二十九年法律第八十九号"]
                },
                {
                    tag: "LawBody",
                    attr: {},
                    children: [
                        {
                            tag: "LawTitle",
                            attr: {},
                            children: ["民法"]
                        },
                        {
                            tag: "EnactStatement",
                            attr: {},
                            children: ["民法第一編第二編第三編別冊ノ通定ム"]
                        },
                        {
                            tag: "EnactStatement",
                            attr: {},
                            children: ["此法律施行ノ期日ハ勅令ヲ以テ之ヲ定ム"]
                        },
                        {
                            tag: "EnactStatement",
                            attr: {},
                            children: ["明治二十三年法律第二十八号民法財産編財産取得編債権担保編証拠編ハ此法律発布ノ日ヨリ廃止ス"]
                        },
                        {
                            tag: "EnactStatement",
                            attr: {},
                            children: ["（別冊）"]
                        },
                        {
                            tag: "MainProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "Article",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "ArticleTitle",
                                            attr: {},
                                            children: ["第一条"]
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
                                                            children: ["私権は、公共の福祉に適合しなければならない。"]
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
                const result = $law.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = lawToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
行政手続法
（平成五年法律第八十八号）

  （目的等）
第一条　この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。
  一　行政運営における公正の確保と透明性
  !:note-struct:
!
２　処分、行政指導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項について、他の法律に特別の定めがある場合は、その定めるところによる。

      附　則　（平成一一年一二月八日法律第一五一号）　抄

  （施行期日）
第一条　この法律は、平成十二年四月一日から施行する。
`;
        const expectedErrorMessages: string[] = ["$paragraphItemNotAmendChildrenBlock: この部分をパースできませんでした。"];
        const expectedRendered = `\
行政手続法
（平成五年法律第八十八号）

  （目的等）
第一条　この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。
  一　行政運営における公正の確保と透明性
２　処分、行政指導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項について、他の法律に特別の定めがある場合は、その定めるところによる。

      附　則　（平成一一年一二月八日法律第一五一号）　抄

  （施行期日）
第一条　この法律は、平成十二年四月一日から施行する。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Law",
            attr: {
                Era: "Heisei",
                Lang: "ja",
                LawType: "Act",
                Num: "88",
                Year: "5",
            },
            children: [
                {
                    tag: "LawNum",
                    attr: {},
                    children: ["平成五年法律第八十八号"]
                },
                {
                    tag: "LawBody",
                    attr: {},
                    children: [
                        {
                            tag: "LawTitle",
                            attr: {},
                            children: ["行政手続法"]
                        },
                        {
                            tag: "MainProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "Article",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "ArticleCaption",
                                            attr: {},
                                            children: ["（目的等）"]
                                        },
                                        {
                                            tag: "ArticleTitle",
                                            attr: {},
                                            children: ["第一条"]
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
                                                            children: ["この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。"]
                                                        }
                                                    ]
                                                },
                                                {
                                                    tag: "Item",
                                                    attr: {},
                                                    children: [
                                                        {
                                                            tag: "ItemTitle",
                                                            attr: {},
                                                            children: ["一"]
                                                        },
                                                        {
                                                            tag: "ItemSentence",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["行政運営における公正の確保と透明性"]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            tag: "Paragraph",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "ParagraphNum",
                                                    attr: {},
                                                    children: ["２"]
                                                },
                                                {
                                                    tag: "ParagraphSentence",
                                                    attr: {},
                                                    children: [
                                                        {
                                                            tag: "Sentence",
                                                            attr: {},
                                                            children: ["処分、行政指導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項について、他の法律に特別の定めがある場合は、その定めるところによる。"]
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
                            tag: "SupplProvision",
                            attr: {
                                AmendLawNum: "平成一一年一二月八日法律第一五一号",
                                Extract: "true"
                            },
                            children: [
                                {
                                    tag: "SupplProvisionLabel",
                                    attr: {},
                                    children: ["附　則"]
                                },
                                {
                                    tag: "Article",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "ArticleCaption",
                                            attr: {},
                                            children: ["（施行期日）"]
                                        },
                                        {
                                            tag: "ArticleTitle",
                                            attr: {},
                                            children: ["第一条"]
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
                                                            children: ["この法律は、平成十二年四月一日から施行する。"]
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
                const result = $law.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = lawToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});
