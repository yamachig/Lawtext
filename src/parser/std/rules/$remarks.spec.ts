import { testLawtextToStd } from "../testHelper";
import { $noteStruct, noteLikeStructToLines } from "./$noteLike";
import $remarks, { remarksToLines } from "./$remarks";

describe("Test $remarks and remarksToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
備考　

  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
備考
  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Remarks",
            attr: {},
            children: [
                {
                    tag: "RemarksLabel",
                    attr: {},
                    children: ["備考"],
                },
                {
                    tag: "Sentence",
                    attr: {},
                    children: ["路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。"],
                },
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => $remarks.match(0, vlines, env),
            el => remarksToLines(el, []),
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
備考　

  一　路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
備考
  一　路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Remarks",
            attr: {},
            children: [
                {
                    tag: "RemarksLabel",
                    attr: {},
                    children: ["備考"],
                },
                {
                    tag: "Item",
                    attr: {
                        Delete: "false",
                    },
                    children: [
                        {
                            tag: "ItemTitle",
                            attr: {},
                            children: ["一"],
                        },
                        {
                            tag: "ItemSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $remarks.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = remarksToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:note-struct:
  備考　
  
    !２　路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。
!    # 一　路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = ["$remarksChildrenBlock: この部分をパースできませんでした。"];
        const expectedRendered = `\
:note-struct:
  備考
    # 一　路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "NoteStruct",
            attr: {},
            children: [
                {
                    tag: "Remarks",
                    attr: {},
                    children: [
                        {
                            tag: "RemarksLabel",
                            attr: {},
                            children: ["備考"],
                        },
                        {
                            tag: "Item",
                            attr: {
                                Delete: "false",
                            },
                            children: [
                                {
                                    tag: "ItemTitle",
                                    attr: {},
                                    children: ["一"],
                                },
                                {
                                    tag: "ItemSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。"],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                }
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => $noteStruct.match(0, vlines, env),
            el => noteLikeStructToLines(el, []),
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
備考　

  !# ２  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。
!
# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = ["$remarksChildrenBlock: この部分をパースできませんでした。"];
        const expectedRendered = `\
備考
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Remarks",
            attr: {},
            children: [
                {
                    tag: "RemarksLabel",
                    attr: {},
                    children: ["備考"],
                },
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => $remarks.match(0, vlines, env),
            el => remarksToLines(el, []),
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:remarks:備考１　

  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:remarks:備考１
  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Remarks",
            attr: {},
            children: [
                {
                    tag: "RemarksLabel",
                    attr: {},
                    children: ["備考１"],
                },
                {
                    tag: "Sentence",
                    attr: {},
                    children: ["路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。"],
                },
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => $remarks.match(0, vlines, env),
            el => remarksToLines(el, []),
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:remarks:　

  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:remarks:
  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Remarks",
            attr: {},
            children: [
                {
                    tag: "Sentence",
                    attr: {},
                    children: ["路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。"],
                },
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => $remarks.match(0, vlines, env),
            el => remarksToLines(el, []),
        );
    });

    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
備考　

    !（成年）
  第四条　年齢二十歳をもって、成年とする。
!
  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。
`;
        const expectedErrorMessages = ["$remarksChildrenBlock: この部分をパースできませんでした。"];
        const expectedRendered = `\
備考
  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Remarks",
            attr: {},
            children: [
                {
                    tag: "RemarksLabel",
                    attr: {},
                    children: ["備考"],
                },
                {
                    tag: "Sentence",
                    attr: {},
                    children: ["路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。"],
                },
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => $remarks.match(0, vlines, env),
            el => remarksToLines(el, []),
        );
    });
});
