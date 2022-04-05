import { testLawtextToStd } from "../testHelper";
import $articleGroup, { articleGroupToLines } from "./$articleGroup";

describe("Test $articleGroup and articleGroupToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
          第三章　不利益処分
        第一節　通則
（処分の基準）
第十二条 行政庁は、処分基準を定め、かつ、これを公にしておくよう努めなければならない。

第二節　聴聞

  （聴聞の通知の方式）
第十五条　　行政庁は、聴聞を行うに当たっては、聴聞を行うべき期日までに相当な期間をおいて、不利益処分の名あて人となるべき者に対し、次に掲げる事項を書面により通知しなければならない。

      第四章　行政指導

  （行政指導の一般原則）
第三十二条　行政指導にあっては、行政指導に携わる者は、いやしくも当該行政機関の任務又は所掌事務の範囲を逸脱してはならないこと及び行政指導の内容があくまでも相手方の任意の協力によってのみ実現されるものであることに留意しなければならない。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
      第三章　不利益処分

        第一節　通則

  （処分の基準）
第十二条　行政庁は、処分基準を定め、かつ、これを公にしておくよう努めなければならない。

        第二節　聴聞

  （聴聞の通知の方式）
第十五条　行政庁は、聴聞を行うに当たっては、聴聞を行うべき期日までに相当な期間をおいて、不利益処分の名あて人となるべき者に対し、次に掲げる事項を書面により通知しなければならない。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
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
                    children: ["第三章　不利益処分"]
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
                            children: ["第一節　通則"]
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
                                    children: ["（処分の基準）"]
                                },
                                {
                                    tag: "ArticleTitle",
                                    attr: {},
                                    children: ["第十二条"]
                                },
                                {
                                    tag: "Paragraph",
                                    attr: {
                                        OldStyle: "false"
                                    },
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
                                                    children: ["行政庁は、処分基準を定め、かつ、これを公にしておくよう努めなければならない。"]
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
                    tag: "Section",
                    attr: {
                        Delete: "false",
                        Hide: "false",
                        Num: "2"
                    },
                    children: [
                        {
                            tag: "SectionTitle",
                            attr: {},
                            children: ["第二節　聴聞"]
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
                                    children: ["（聴聞の通知の方式）"]
                                },
                                {
                                    tag: "ArticleTitle",
                                    attr: {},
                                    children: ["第十五条"]
                                },
                                {
                                    tag: "Paragraph",
                                    attr: {
                                        OldStyle: "false"
                                    },
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
                                                    children: ["行政庁は、聴聞を行うに当たっては、聴聞を行うべき期日までに相当な期間をおいて、不利益処分の名あて人となるべき者に対し、次に掲げる事項を書面により通知しなければならない。"]
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
                const result = $articleGroup.match(0, vlines, env);
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(), undefined, 2));
                return result;
            },
            el => articleGroupToLines(el, []),
        );
    });

    it("Successcase", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
          第二款　外国人観光旅客の来訪の促進

        第一節　通則

!第○条　削除
!
第十三条　削除
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
          第二款　外国人観光旅客の来訪の促進
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Subsection",
            attr: {
                Delete: "false",
                Hide: "false",
                Num: "2"
            },
            children: [
                {
                    tag: "SubsectionTitle",
                    attr: {},
                    children: ["第二款　外国人観光旅客の来訪の促進"]
                },
            ]
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $articleGroup.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = articleGroupToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
          第二款　外国人観光旅客の来訪の促進

!第○条　削除
!
第十三条　削除
`;
        const expectedErrorMessages: string[] = ["$articleGroup: この部分をパースできませんでした。"];
        const expectedRendered = `\
          第二款　外国人観光旅客の来訪の促進

第十三条　削除
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Subsection",
            attr: {
                Delete: "false",
                Hide: "false",
                Num: "2"
            },
            children: [
                {
                    tag: "SubsectionTitle",
                    attr: {},
                    children: ["第二款　外国人観光旅客の来訪の促進"]
                },
                {
                    tag: "Article",
                    attr: {
                        Delete: "false",
                        Hide: "false"
                    },
                    children: [
                        {
                            tag: "ArticleTitle",
                            attr: {},
                            children: ["第十三条"]
                        },
                        {
                            tag: "Paragraph",
                            attr: {
                                OldStyle: "false"
                            },
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
                                            children: ["削除"]
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
                const result = $articleGroup.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = articleGroupToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });


});
