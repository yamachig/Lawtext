import { testLawtextToStd } from "../testHelper";
import $toc, { tocToLines } from "./$toc";

describe("Test $toc and tocToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
目次
  前文
  第一条　都市計画法の施行期日
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

別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
目次
  前文
  第一条　都市計画法の施行期日
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

`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "TOC",
            attr: {},
            children: [
                {
                    tag: "TOCLabel",
                    attr: {},
                    children: ["目次"]
                },
                {
                    tag: "TOCPreambleLabel",
                    attr: {},
                    children: ["前文"]
                },
                {
                    tag: "TOCArticle",
                    attr: {},
                    children: [
                        {
                            tag: "ArticleTitle",
                            attr: {},
                            children: ["第一条"]
                        },
                        {
                            tag: "ArticleCaption",
                            attr: {},
                            children: ["都市計画法の施行期日"]
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
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $toc.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = tocToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});
