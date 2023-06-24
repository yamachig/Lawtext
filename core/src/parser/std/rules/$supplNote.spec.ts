import { testLawtextToStd } from "../testHelper";
import $article, { articleToLines } from "./$article";

describe("Test $supplNote and supplNoteToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
  （信号機の信号等に従う義務）
第七条　道路を通行する歩行者又は車両等は、信号機の表示する信号又は警察官等の手信号等（前条第一項後段の場合においては、当該手信号等）に従わなければならない。

:suppl-note:（罰則　第百十九条第一項第一号の二、同条第二項、第百二十一条第一項第一号）

  （通行の禁止等）
第八条　歩行者又は車両等は、道路標識等によりその通行を禁止されている道路又はその部分を通行してはならない。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
  （信号機の信号等に従う義務）
第七条　道路を通行する歩行者又は車両等は、信号機の表示する信号又は警察官等の手信号等（前条第一項後段の場合においては、当該手信号等）に従わなければならない。
:suppl-note:（罰則　第百十九条第一項第一号の二、同条第二項、第百二十一条第一項第一号）
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Article",
            attr: {            },
            children: [
                {
                    tag: "ArticleCaption",
                    attr: {},
                    children: ["（信号機の信号等に従う義務）"]
                },
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: ["第七条"]
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
                                    children: ["道路を通行する歩行者又は車両等は、信号機の表示する信号又は警察官等の手信号等（前条第一項後段の場合においては、当該手信号等）に従わなければならない。"]
                                }
                            ]
                        }
                    ]
                },
                {
                    tag: "SupplNote",
                    attr: {},
                    children: ["（罰則　第百十九条第一項第一号の二、同条第二項、第百二十一条第一項第一号）"]
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

});
