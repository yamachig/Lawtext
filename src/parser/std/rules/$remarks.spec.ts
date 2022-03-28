import { testLawtextToStd } from "../testHelper";
import $remarks, { remarksToLines } from "./$remarks";

describe("Test $remarks and remarksToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
備考　

  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。

別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
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
:remarks:備考１　

  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。

別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
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

別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
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

  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。

    !（成年）
!  第四条　年齢二十歳をもって、成年とする。
`;
        const expectedErrorMessages = ["$remarks: この前にある備考の終了時にインデント解除が必要です。" ];
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
