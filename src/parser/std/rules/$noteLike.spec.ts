import { testLawtextToStd } from "../testHelper";
import { $formatStruct, $noteStruct, $styleStruct, noteLikeStructToLines } from "./$noteLike";

describe("Test $noteStruct and noteLikeStructToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:note-struct:付録第三　

  <Fig src="./pict/S39SE188-002.jpg"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:note-struct:付録第三
  <Fig src="./pict/S39SE188-002.jpg"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "NoteStruct",
            attr: {},
            children: [
                {
                    tag: "NoteStructTitle",
                    attr: {},
                    children: ["付録第三"],
                },
                {
                    tag: "Note",
                    attr: { },
                    children: [
                        {
                            tag: "FigStruct",
                            attr: { },
                            children: [
                                {
                                    tag: "Fig",
                                    attr: { src: "./pict/S39SE188-002.jpg" },
                                    children: [],
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
                const result = $noteStruct.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = noteLikeStructToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:note-struct:　

  <Fig src="./pict/S39SE188-002.jpg"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:note-struct:
  <Fig src="./pict/S39SE188-002.jpg"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "NoteStruct",
            attr: {},
            children: [
                {
                    tag: "Note",
                    attr: { },
                    children: [
                        {
                            tag: "FigStruct",
                            attr: { },
                            children: [
                                {
                                    tag: "Fig",
                                    attr: { src: "./pict/S39SE188-002.jpg" },
                                    children: [],
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
                const result = $noteStruct.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = noteLikeStructToLines(el, []);
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
    備考文１

  <Fig src="./pict/S39SE188-002.jpg"/>

  :remarks:

    備考文２

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:note-struct:
  備考
    備考文１
  <Fig src="./pict/S39SE188-002.jpg"/>
  :remarks:
    備考文２
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
                            tag: "Sentence",
                            attr: {},
                            children: ["備考文１"],
                        },
                    ],
                },
                {
                    tag: "Note",
                    attr: { },
                    children: [
                        {
                            tag: "FigStruct",
                            attr: { },
                            children: [
                                {
                                    tag: "Fig",
                                    attr: { src: "./pict/S39SE188-002.jpg" },
                                    children: [],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "Remarks",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: ["備考文２"],
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
                const result = $noteStruct.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = noteLikeStructToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:note-struct:　

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:note-struct:
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "NoteStruct",
            attr: {},
            children: [],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $noteStruct.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = noteLikeStructToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});

describe("Test $styleStruct and noteLikeStructToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:style-struct:付録第三　

  <Fig src="./pict/S39SE188-002.jpg"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:style-struct:付録第三
  <Fig src="./pict/S39SE188-002.jpg"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "StyleStruct",
            attr: {},
            children: [
                {
                    tag: "StyleStructTitle",
                    attr: {},
                    children: ["付録第三"],
                },
                {
                    tag: "Style",
                    attr: { },
                    children: [
                        {
                            tag: "FigStruct",
                            attr: { },
                            children: [
                                {
                                    tag: "Fig",
                                    attr: { src: "./pict/S39SE188-002.jpg" },
                                    children: [],
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
                const result = $styleStruct.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = noteLikeStructToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:style-struct:　

  <Fig src="./pict/S39SE188-002.jpg"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:style-struct:
  <Fig src="./pict/S39SE188-002.jpg"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "StyleStruct",
            attr: {},
            children: [
                {
                    tag: "Style",
                    attr: { },
                    children: [
                        {
                            tag: "FigStruct",
                            attr: { },
                            children: [
                                {
                                    tag: "Fig",
                                    attr: { src: "./pict/S39SE188-002.jpg" },
                                    children: [],
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
                const result = $styleStruct.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = noteLikeStructToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:style-struct:　
  備考
    備考文１

  <Fig src="./pict/S39SE188-002.jpg"/>

  :remarks:

    備考文２

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:style-struct:
  備考
    備考文１
  <Fig src="./pict/S39SE188-002.jpg"/>
  :remarks:
    備考文２
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "StyleStruct",
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
                            tag: "Sentence",
                            attr: {},
                            children: ["備考文１"],
                        },
                    ],
                },
                {
                    tag: "Style",
                    attr: { },
                    children: [
                        {
                            tag: "FigStruct",
                            attr: { },
                            children: [
                                {
                                    tag: "Fig",
                                    attr: { src: "./pict/S39SE188-002.jpg" },
                                    children: [],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "Remarks",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: ["備考文２"],
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
                const result = $styleStruct.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = noteLikeStructToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});

describe("Test $formatStruct and noteLikeStructToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:format-struct:付録第三　

  <Fig src="./pict/S39SE188-002.jpg"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:format-struct:付録第三
  <Fig src="./pict/S39SE188-002.jpg"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "FormatStruct",
            attr: {},
            children: [
                {
                    tag: "FormatStructTitle",
                    attr: {},
                    children: ["付録第三"],
                },
                {
                    tag: "Format",
                    attr: { },
                    children: [
                        {
                            tag: "FigStruct",
                            attr: { },
                            children: [
                                {
                                    tag: "Fig",
                                    attr: { src: "./pict/S39SE188-002.jpg" },
                                    children: [],
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
                const result = $formatStruct.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = noteLikeStructToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:format-struct:　

  <Fig src="./pict/S39SE188-002.jpg"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:format-struct:
  <Fig src="./pict/S39SE188-002.jpg"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "FormatStruct",
            attr: {},
            children: [
                {
                    tag: "Format",
                    attr: { },
                    children: [
                        {
                            tag: "FigStruct",
                            attr: { },
                            children: [
                                {
                                    tag: "Fig",
                                    attr: { src: "./pict/S39SE188-002.jpg" },
                                    children: [],
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
                const result = $formatStruct.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = noteLikeStructToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:format-struct:　
  備考
    備考文１

  <Fig src="./pict/S39SE188-002.jpg"/>

  :remarks:

    備考文２

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:format-struct:
  備考
    備考文１
  <Fig src="./pict/S39SE188-002.jpg"/>
  :remarks:
    備考文２
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "FormatStruct",
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
                            tag: "Sentence",
                            attr: {},
                            children: ["備考文１"],
                        },
                    ],
                },
                {
                    tag: "Format",
                    attr: { },
                    children: [
                        {
                            tag: "FigStruct",
                            attr: { },
                            children: [
                                {
                                    tag: "Fig",
                                    attr: { src: "./pict/S39SE188-002.jpg" },
                                    children: [],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "Remarks",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: ["備考文２"],
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
                const result = $formatStruct.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = noteLikeStructToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});
