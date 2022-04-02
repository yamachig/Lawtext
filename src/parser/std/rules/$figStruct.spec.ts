import { testLawtextToStd } from "../testHelper";
import $figStruct, { figStructToLines } from "./$figStruct";

describe("Test $figStruct and figStructToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:fig-struct:Ａ図　

  <Fig src="./pict/S27F03901000056-005.jpg"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:fig-struct:Ａ図
  <Fig src="./pict/S27F03901000056-005.jpg"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "FigStruct",
            attr: {},
            children: [
                {
                    tag: "FigStructTitle",
                    attr: {},
                    children: ["Ａ図"],
                },
                {
                    tag: "Fig",
                    attr: { src: "./pict/S27F03901000056-005.jpg" },
                    children: [],
                },
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $figStruct.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = figStructToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:fig-struct:　

  <Fig src="./pict/S27F03901000056-005.jpg"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
<Fig src="./pict/S27F03901000056-005.jpg"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "FigStruct",
            attr: {},
            children: [
                {
                    tag: "Fig",
                    attr: { src: "./pict/S27F03901000056-005.jpg" },
                    children: [],
                },
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $figStruct.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = figStructToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:fig-struct:　

  !<Fig/>
!
# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = ["$figStruct: Figタグ に src 属性が設定されていません。"];
        const expectedRendered = `\
<Fig src=""/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "FigStruct",
            attr: {},
            children: [
                {
                    tag: "Fig",
                    attr: { src: "" },
                    children: [],
                },
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $figStruct.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = figStructToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});
