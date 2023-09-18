import { assert } from "chai";
import { matchResultToJson } from "generic-parser/lib/core";
import { Controls } from "../../../node/cst/inline";
import { LineType } from "../../../node/cst/line";
import { JsonEL } from "../../../node/el/jsonEL";
import { initialEnv } from "../env";
import $appdxItemHeadLine from "./$appdxItemHeadLine";

const env = initialEnv({});

describe("Test $appdxItemHeadLine", () => {

    it("Success case (:appdx:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:appdx:付録第一（第二十六条、第四十五条、第四十六条の五関係）　

  <Fig src="./pict/001.jpg"/>
`;
        const expectedResult = {
            ok: true,
            nextOffset: 36,
        } as const;
        const expectedText = `\
:appdx:付録第一（第二十六条、第四十五条、第四十六条の五関係）　
`;
        const expectedValue = {
            type: LineType.APP,
            indentTexts: [] as string[],
            mainTag: "Appdx",
            controls: [
                {
                    control: ":appdx:",
                    controlRange: [0, 7],
                    trailingSpace: "",
                    trailingSpaceRange: [7, 7],
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedTitle = [
            {
                tag: "__Text",
                attr: {},
                children: ["付録第一"],
            },
        ];
        const expectedRelatedArticleNum = [
            {
                tag: "__Parentheses",
                attr: {
                    type: "round",
                    depth: "1"
                },
                children: [
                    {
                        tag: "__PStart",
                        attr: {
                            type: "round"
                        },
                        children: ["（"]
                    },
                    {
                        tag: "__PContent",
                        attr: {
                            type: "round"
                        },
                        children: [
                            {
                                tag: "____PointerRanges",
                                attr: {},
                                children: [
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第二十六条"
                                                        },
                                                        children: ["第二十六条"]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        tag: "__Text",
                                        attr: {},
                                        children: ["、"]
                                    },
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第四十五条"
                                                        },
                                                        children: ["第四十五条"]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        tag: "__Text",
                                        attr: {},
                                        children: ["、"]
                                    },
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第四十六条の五"
                                                        },
                                                        children: ["第四十六条の五"]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["関係"]
                            }
                        ]
                    },
                    {
                        tag: "__PEnd",
                        attr: {
                            type: "round"
                        },
                        children: ["）"]
                    }
                ]
            }
        ];
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedTitle);
            // console.log(JSON.stringify(result.value.value.relatedArticleNum.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.relatedArticleNum.map(el => el.json(true)), expectedRelatedArticleNum);
        }
    });

    it("Success case (:appdx:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:appdx:  付録第一（第二十六条、第四十五条、第四十六条の五関係）　

  <Fig src="./pict/001.jpg"/>
`;
        const expectedResult = {
            ok: true,
            nextOffset: 38,
        } as const;
        const expectedText = `\
:appdx:  付録第一（第二十六条、第四十五条、第四十六条の五関係）　
`;
        const expectedValue = {
            type: LineType.APP,
            indentTexts: [] as string[],
            mainTag: "Appdx",
            controls: [
                {
                    control: ":appdx:",
                    controlRange: [0, 7],
                    trailingSpace: "  ",
                    trailingSpaceRange: [7, 9],
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedTitle = [
            {
                tag: "__Text",
                attr: {},
                children: ["付録第一"],
            },
        ];
        const expectedRelatedArticleNum = [
            {
                tag: "__Parentheses",
                attr: {
                    type: "round",
                    depth: "1"
                },
                children: [
                    {
                        tag: "__PStart",
                        attr: {
                            type: "round"
                        },
                        children: ["（"]
                    },
                    {
                        tag: "__PContent",
                        attr: {
                            type: "round"
                        },
                        children: [
                            {
                                tag: "____PointerRanges",
                                attr: {},
                                children: [
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第二十六条"
                                                        },
                                                        children: ["第二十六条"]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        tag: "__Text",
                                        attr: {},
                                        children: ["、"]
                                    },
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第四十五条"
                                                        },
                                                        children: ["第四十五条"]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        tag: "__Text",
                                        attr: {},
                                        children: ["、"]
                                    },
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第四十六条の五"
                                                        },
                                                        children: ["第四十六条の五"]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["関係"]
                            }
                        ]
                    },
                    {
                        tag: "__PEnd",
                        attr: {
                            type: "round"
                        },
                        children: ["）"]
                    }
                ]
            }
        ];
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedTitle);
            // console.log(JSON.stringify(result.value.value.relatedArticleNum.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.relatedArticleNum.map(el => el.json(true)), expectedRelatedArticleNum);
        }
    });

    it("Success case (w/o :appdx:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
# 付録第一（第二十六条、第四十五条、第四十六条の五関係）　

  <Fig src="./pict/001.jpg"/>
`;
        const expectedResult = {
            ok: true,
            nextOffset: 31,
        } as const;
        const expectedText = `\
# 付録第一（第二十六条、第四十五条、第四十六条の五関係）　
`;
        const expectedValue = {
            type: LineType.APP,
            indentTexts: [] as string[],
            mainTag: "Appdx",
            controls: [
                {
                    control: "#",
                    controlRange: [0, 1],
                    trailingSpace: " ",
                    trailingSpaceRange: [1, 2],
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedTitle = [
            {
                tag: "__Text",
                attr: {},
                children: ["付録第一"],
            },
        ];
        const expectedRelatedArticleNum = [
            {
                tag: "__Parentheses",
                attr: {
                    type: "round",
                    depth: "1"
                },
                children: [
                    {
                        tag: "__PStart",
                        attr: {
                            type: "round"
                        },
                        children: ["（"]
                    },
                    {
                        tag: "__PContent",
                        attr: {
                            type: "round"
                        },
                        children: [
                            {
                                tag: "____PointerRanges",
                                attr: {},
                                children: [
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第二十六条"
                                                        },
                                                        children: ["第二十六条"]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        tag: "__Text",
                                        attr: {},
                                        children: ["、"]
                                    },
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第四十五条"
                                                        },
                                                        children: ["第四十五条"]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        tag: "__Text",
                                        attr: {},
                                        children: ["、"]
                                    },
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第四十六条の五"
                                                        },
                                                        children: ["第四十六条の五"]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["関係"]
                            }
                        ]
                    },
                    {
                        tag: "__PEnd",
                        attr: {
                            type: "round"
                        },
                        children: ["）"]
                    }
                ]
            }
        ];
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedTitle);
            // console.log(JSON.stringify(result.value.value.relatedArticleNum.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.relatedArticleNum.map(el => el.json(true)), expectedRelatedArticleNum);
        }
    });

    it("Success case (:appdx-table:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:appdx-table:別表第二（第十九条、第二十一条関係）　

  * - 情報照会者
    - 事務
`;
        const expectedResult = {
            ok: true,
            nextOffset: 33,
        } as const;
        const expectedText = `\
:appdx-table:別表第二（第十九条、第二十一条関係）　
`;
        const expectedValue = {
            type: LineType.APP,
            indentTexts: [] as string[],
            mainTag: "AppdxTable",
            controls: [
                {
                    control: ":appdx-table:",
                    controlRange: [0, 13],
                    trailingSpace: "",
                    trailingSpaceRange: [13, 13],
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedTitle = [
            {
                tag: "__Text",
                attr: {},
                children: ["別表第二"],
            },
        ];
        const expectedRelatedArticleNum = [
            {
                tag: "__Parentheses",
                attr: {
                    type: "round",
                    depth: "1"
                },
                children: [
                    {
                        tag: "__PStart",
                        attr: {
                            type: "round"
                        },
                        children: ["（"]
                    },
                    {
                        tag: "__PContent",
                        attr: {
                            type: "round"
                        },
                        children: [
                            {
                                tag: "____PointerRanges",
                                attr: {},
                                children: [
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第十九条"
                                                        },
                                                        children: ["第十九条"]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        tag: "__Text",
                                        attr: {},
                                        children: ["、"]
                                    },
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第二十一条"
                                                        },
                                                        children: ["第二十一条"]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["関係"]
                            }
                        ]
                    },
                    {
                        tag: "__PEnd",
                        attr: {
                            type: "round"
                        },
                        children: ["）"]
                    }
                ]
            }
        ];
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedTitle);
            // console.log(JSON.stringify(result.value.value.relatedArticleNum.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.relatedArticleNum.map(el => el.json(true)), expectedRelatedArticleNum);
        }
    });

    it("Success case (w/o :appdx-table:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
# 別表第二（第十九条、第二十一条関係）　

  * - 情報照会者
    - 事務
`;
        const expectedResult = {
            ok: true,
            nextOffset: 22,
        } as const;
        const expectedText = `\
# 別表第二（第十九条、第二十一条関係）　
`;
        const expectedValue = {
            type: LineType.APP,
            indentTexts: [] as string[],
            mainTag: "AppdxTable",
            controls: [
                {
                    control: "#",
                    controlRange: [0, 1],
                    trailingSpace: " ",
                    trailingSpaceRange: [1, 2],
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedTitle = [
            {
                tag: "__Text",
                attr: {},
                children: ["別表第二"],
            },
        ];
        const expectedRelatedArticleNum = [
            {
                tag: "__Parentheses",
                attr: {
                    type: "round",
                    depth: "1"
                },
                children: [
                    {
                        tag: "__PStart",
                        attr: {
                            type: "round"
                        },
                        children: ["（"]
                    },
                    {
                        tag: "__PContent",
                        attr: {
                            type: "round"
                        },
                        children: [
                            {
                                tag: "____PointerRanges",
                                attr: {},
                                children: [
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第十九条"
                                                        },
                                                        children: ["第十九条"]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        tag: "__Text",
                                        attr: {},
                                        children: ["、"]
                                    },
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第二十一条"
                                                        },
                                                        children: ["第二十一条"]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["関係"]
                            }
                        ]
                    },
                    {
                        tag: "__PEnd",
                        attr: {
                            type: "round"
                        },
                        children: ["）"]
                    }
                ]
            }
        ];
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedTitle);
            // console.log(JSON.stringify(result.value.value.relatedArticleNum.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.relatedArticleNum.map(el => el.json(true)), expectedRelatedArticleNum);
        }
    });

    it("Success case (:appdx-style:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:appdx-style:別記様式（第十四条関係）　

  <Fig src="./pict/001.pdf"/>
`;
        const expectedResult = {
            ok: true,
            nextOffset: 27,
        } as const;
        const expectedText = `\
:appdx-style:別記様式（第十四条関係）　
`;
        const expectedValue = {
            type: LineType.APP,
            indentTexts: [] as string[],
            mainTag: "AppdxStyle",
            controls: [
                {
                    control: ":appdx-style:",
                    controlRange: [0, 13],
                    trailingSpace: "",
                    trailingSpaceRange: [13, 13],
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedTitle = [
            {
                tag: "__Text",
                attr: {},
                children: ["別記様式"],
            },
        ];
        const expectedRelatedArticleNum = [
            {
                tag: "__Parentheses",
                attr: {
                    type: "round",
                    depth: "1"
                },
                children: [
                    {
                        tag: "__PStart",
                        attr: {
                            type: "round"
                        },
                        children: ["（"]
                    },
                    {
                        tag: "__PContent",
                        attr: {
                            type: "round"
                        },
                        children: [
                            {
                                tag: "____PointerRanges",
                                attr: {},
                                children: [
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第十四条"
                                                        },
                                                        children: ["第十四条"]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["関係"]
                            }
                        ]
                    },
                    {
                        tag: "__PEnd",
                        attr: {
                            type: "round"
                        },
                        children: ["）"]
                    }
                ]
            }
        ];
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedTitle);
            // console.log(JSON.stringify(result.value.value.relatedArticleNum.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.relatedArticleNum.map(el => el.json(true)), expectedRelatedArticleNum);
        }
    });

    it("Success case (:appdx-style:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:appdx-style:別記様式　

  <Fig src="./pict/001.pdf"/>
`;
        const expectedResult = {
            ok: true,
            nextOffset: 19,
        } as const;
        const expectedText = `\
:appdx-style:別記様式　
`;
        const expectedValue = {
            type: LineType.APP,
            indentTexts: [] as string[],
            mainTag: "AppdxStyle",
            controls: [
                {
                    control: ":appdx-style:",
                    controlRange: [0, 13],
                    trailingSpace: "",
                    trailingSpaceRange: [13, 13],
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedTitle = [
            {
                tag: "__Text",
                attr: {},
                children: ["別記様式"],
            },
        ];
        const expectedRelatedArticleNum = [] as JsonEL[];
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedTitle);
            // console.log(JSON.stringify(result.value.value.relatedArticleNum.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.relatedArticleNum.map(el => el.json(true)), expectedRelatedArticleNum);
        }
    });

    it("Success case (w/o :appdx-style:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
# 別記様式（第十四条関係）　

  <Fig src="./pict/001.pdf"/>
`;
        const expectedResult = {
            ok: true,
            nextOffset: 16,
        } as const;
        const expectedText = `\
# 別記様式（第十四条関係）　
`;
        const expectedValue = {
            type: LineType.APP,
            indentTexts: [] as string[],
            mainTag: "AppdxStyle",
            controls: [
                {
                    control: "#",
                    controlRange: [0, 1],
                    trailingSpace: " ",
                    trailingSpaceRange: [1, 2],
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedTitle = [
            {
                tag: "__Text",
                attr: {},
                children: ["別記様式"],
            },
        ];
        const expectedRelatedArticleNum = [
            {
                tag: "__Parentheses",
                attr: {
                    type: "round",
                    depth: "1"
                },
                children: [
                    {
                        tag: "__PStart",
                        attr: {
                            type: "round"
                        },
                        children: ["（"]
                    },
                    {
                        tag: "__PContent",
                        attr: {
                            type: "round"
                        },
                        children: [
                            {
                                tag: "____PointerRanges",
                                attr: {},
                                children: [
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第十四条"
                                                        },
                                                        children: ["第十四条"]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["関係"]
                            }
                        ]
                    },
                    {
                        tag: "__PEnd",
                        attr: {
                            type: "round"
                        },
                        children: ["）"]
                    }
                ]
            }
        ];
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedTitle);
            // console.log(JSON.stringify(result.value.value.relatedArticleNum.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.relatedArticleNum.map(el => el.json(true)), expectedRelatedArticleNum);
        }
    });

    it("Success case (:appdx-format:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:appdx-format:別紙第一号書式（第三条関係）　

  <Fig src="./pict/001.pdf"/>
`;
        const expectedResult = {
            ok: true,
            nextOffset: 30,
        } as const;
        const expectedText = `\
:appdx-format:別紙第一号書式（第三条関係）　
`;
        const expectedValue = {
            type: LineType.APP,
            indentTexts: [] as string[],
            mainTag: "AppdxFormat",
            controls: [
                {
                    control: ":appdx-format:",
                    controlRange: [0, 14],
                    trailingSpace: "",
                    trailingSpaceRange: [14, 14],
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedTitle = [
            {
                tag: "__Text",
                attr: {},
                children: ["別紙第一号書式"],
            },
        ];
        const expectedRelatedArticleNum = [
            {
                tag: "__Parentheses",
                attr: {
                    type: "round",
                    depth: "1"
                },
                children: [
                    {
                        tag: "__PStart",
                        attr: {
                            type: "round"
                        },
                        children: ["（"]
                    },
                    {
                        tag: "__PContent",
                        attr: {
                            type: "round"
                        },
                        children: [
                            {
                                tag: "____PointerRanges",
                                attr: {},
                                children: [
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第三条"
                                                        },
                                                        children: ["第三条"]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["関係"]
                            }
                        ]
                    },
                    {
                        tag: "__PEnd",
                        attr: {
                            type: "round"
                        },
                        children: ["）"]
                    }
                ]
            }
        ];
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedTitle);
            // console.log(JSON.stringify(result.value.value.relatedArticleNum.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.relatedArticleNum.map(el => el.json(true)), expectedRelatedArticleNum);
        }
    });

    it("Success case (w/o :appdx-format:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
# 別紙第一号書式（第三条関係）　

  <Fig src="./pict/001.pdf"/>
`;
        const expectedResult = {
            ok: true,
            nextOffset: 18,
        } as const;
        const expectedText = `\
# 別紙第一号書式（第三条関係）　
`;
        const expectedValue = {
            type: LineType.APP,
            indentTexts: [] as string[],
            mainTag: "AppdxFormat",
            controls: [
                {
                    control: "#",
                    controlRange: [0, 1],
                    trailingSpace: " ",
                    trailingSpaceRange: [1, 2],
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedTitle = [
            {
                tag: "__Text",
                attr: {},
                children: ["別紙第一号書式"],
            },
        ];
        const expectedRelatedArticleNum = [
            {
                tag: "__Parentheses",
                attr: {
                    type: "round",
                    depth: "1"
                },
                children: [
                    {
                        tag: "__PStart",
                        attr: {
                            type: "round"
                        },
                        children: ["（"]
                    },
                    {
                        tag: "__PContent",
                        attr: {
                            type: "round"
                        },
                        children: [
                            {
                                tag: "____PointerRanges",
                                attr: {},
                                children: [
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第三条"
                                                        },
                                                        children: ["第三条"]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["関係"]
                            }
                        ]
                    },
                    {
                        tag: "__PEnd",
                        attr: {
                            type: "round"
                        },
                        children: ["）"]
                    }
                ]
            }
        ];
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedTitle);
            // console.log(JSON.stringify(result.value.value.relatedArticleNum.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.relatedArticleNum.map(el => el.json(true)), expectedRelatedArticleNum);
        }
    });

    it("Success case (:appdx-fig:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:appdx-fig:　別図第十一（第１９条第１項の表の６の項関係）　

  <Fig src="./pict/011.jpg"/>
`;
        const expectedResult = {
            ok: true,
            nextOffset: 36,
        } as const;
        const expectedText = `\
:appdx-fig:　別図第十一（第１９条第１項の表の６の項関係）　
`;
        const expectedValue = {
            type: LineType.APP,
            indentTexts: [] as string[],
            mainTag: "AppdxFig",
            controls: [
                {
                    control: ":appdx-fig:",
                    controlRange: [0, 11],
                    trailingSpace: "　",
                    trailingSpaceRange: [11, 12],
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedTitle = [
            {
                tag: "__Text",
                attr: {},
                children: ["別図第十一"],
            },
        ];
        const expectedRelatedArticleNum = [
            {
                tag: "__Parentheses",
                attr: {
                    type: "round",
                    depth: "1"
                },
                children: [
                    {
                        tag: "__PStart",
                        attr: {
                            type: "round"
                        },
                        children: ["（"]
                    },
                    {
                        tag: "__PContent",
                        attr: {
                            type: "round"
                        },
                        children: [
                            {
                                tag: "____PointerRanges",
                                attr: {},
                                children: [
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第１９条"
                                                        },
                                                        children: ["第１９条"]
                                                    },
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Paragraph",
                                                            name: "第１項"
                                                        },
                                                        children: ["第１項"]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["の表の６の項関係"]
                            }
                        ]
                    },
                    {
                        tag: "__PEnd",
                        attr: {
                            type: "round"
                        },
                        children: ["）"]
                    }
                ]
            }
        ];
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedTitle);
            // console.log(JSON.stringify(result.value.value.relatedArticleNum.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.relatedArticleNum.map(el => el.json(true)), expectedRelatedArticleNum);
        }
    });

    it("Success case (w/o :appdx-fig:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
# 別図第十一（第１９条第１項の表の６の項関係）　

  <Fig src="./pict/011.jpg"/>
`;
        const expectedResult = {
            ok: true,
            nextOffset: 26,
        } as const;
        const expectedText = `\
# 別図第十一（第１９条第１項の表の６の項関係）　
`;
        const expectedValue = {
            type: LineType.APP,
            indentTexts: [] as string[],
            mainTag: "AppdxFig",
            controls: [
                {
                    control: "#",
                    controlRange: [0, 1],
                    trailingSpace: " ",
                    trailingSpaceRange: [1, 2],
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedTitle = [
            {
                tag: "__Text",
                attr: {},
                children: ["別図第十一"],
            },
        ];
        const expectedRelatedArticleNum = [
            {
                tag: "__Parentheses",
                attr: {
                    type: "round",
                    depth: "1"
                },
                children: [
                    {
                        tag: "__PStart",
                        attr: {
                            type: "round"
                        },
                        children: ["（"]
                    },
                    {
                        tag: "__PContent",
                        attr: {
                            type: "round"
                        },
                        children: [
                            {
                                tag: "____PointerRanges",
                                attr: {},
                                children: [
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第１９条"
                                                        },
                                                        children: ["第１９条"]
                                                    },
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Paragraph",
                                                            name: "第１項"
                                                        },
                                                        children: ["第１項"]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["の表の６の項関係"]
                            }
                        ]
                    },
                    {
                        tag: "__PEnd",
                        attr: {
                            type: "round"
                        },
                        children: ["）"]
                    }
                ]
            }
        ];
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedTitle);
            // console.log(JSON.stringify(result.value.value.relatedArticleNum.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.relatedArticleNum.map(el => el.json(true)), expectedRelatedArticleNum);
        }
    });

    it("Success case (:appdx-note:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:appdx-note:別記第二号（第一条第一項、第九条関係）　

  <Fig src="./pict/002.pdf"/>
`;
        const expectedResult = {
            ok: true,
            nextOffset: 33,
        } as const;
        const expectedText = `\
:appdx-note:別記第二号（第一条第一項、第九条関係）　
`;
        const expectedValue = {
            type: LineType.APP,
            indentTexts: [] as string[],
            mainTag: "AppdxNote",
            controls: [
                {
                    control: ":appdx-note:",
                    controlRange: [0, 12],
                    trailingSpace: "",
                    trailingSpaceRange: [12, 12],
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedTitle = [
            {
                tag: "__Text",
                attr: {},
                children: ["別記第二号"],
            },
        ];
        const expectedRelatedArticleNum = [
            {
                tag: "__Parentheses",
                attr: {
                    type: "round",
                    depth: "1"
                },
                children: [
                    {
                        tag: "__PStart",
                        attr: {
                            type: "round"
                        },
                        children: ["（"]
                    },
                    {
                        tag: "__PContent",
                        attr: {
                            type: "round"
                        },
                        children: [
                            {
                                tag: "____PointerRanges",
                                attr: {},
                                children: [
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第一条"
                                                        },
                                                        children: ["第一条"]
                                                    },
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Paragraph",
                                                            name: "第一項"
                                                        },
                                                        children: ["第一項"]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        tag: "__Text",
                                        attr: {},
                                        children: ["、"]
                                    },
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第九条"
                                                        },
                                                        children: ["第九条"]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["関係"]
                            }
                        ]
                    },
                    {
                        tag: "__PEnd",
                        attr: {
                            type: "round"
                        },
                        children: ["）"]
                    }
                ]
            }
        ];
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedTitle);
            // console.log(JSON.stringify(result.value.value.relatedArticleNum.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.relatedArticleNum.map(el => el.json(true)), expectedRelatedArticleNum);
        }
    });

    it("Success case (w/o :appdx-note:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
# 別記第二号（第一条第一項、第九条関係）　

  <Fig src="./pict/002.pdf"/>
`;
        const expectedResult = {
            ok: true,
            nextOffset: 23,
        } as const;
        const expectedText = `\
# 別記第二号（第一条第一項、第九条関係）　
`;
        const expectedValue = {
            type: LineType.APP,
            indentTexts: [] as string[],
            mainTag: "AppdxNote",
            controls: [
                {
                    control: "#",
                    controlRange: [0, 1],
                    trailingSpace: " ",
                    trailingSpaceRange: [1, 2],
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedTitle = [
            {
                tag: "__Text",
                attr: {},
                children: ["別記第二号"],
            },
        ];
        const expectedRelatedArticleNum = [
            {
                tag: "__Parentheses",
                attr: {
                    type: "round",
                    depth: "1"
                },
                children: [
                    {
                        tag: "__PStart",
                        attr: {
                            type: "round"
                        },
                        children: ["（"]
                    },
                    {
                        tag: "__PContent",
                        attr: {
                            type: "round"
                        },
                        children: [
                            {
                                tag: "____PointerRanges",
                                attr: {},
                                children: [
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第一条"
                                                        },
                                                        children: ["第一条"]
                                                    },
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Paragraph",
                                                            name: "第一項"
                                                        },
                                                        children: ["第一項"]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        tag: "__Text",
                                        attr: {},
                                        children: ["、"]
                                    },
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第九条"
                                                        },
                                                        children: ["第九条"]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["関係"]
                            }
                        ]
                    },
                    {
                        tag: "__PEnd",
                        attr: {
                            type: "round"
                        },
                        children: ["）"]
                    }
                ]
            }
        ];
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedTitle);
            // console.log(JSON.stringify(result.value.value.relatedArticleNum.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.relatedArticleNum.map(el => el.json(true)), expectedRelatedArticleNum);
        }
    });

    it("Fail case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
# 附則別表第二（第十九条、第二十一条関係）

  * - 情報照会者
    - 事務
`;
        const expectedResult = {
            ok: false,
            offset: 0,
            expected: "appdxItemHeadLine",
        } as const;
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
    });
});
