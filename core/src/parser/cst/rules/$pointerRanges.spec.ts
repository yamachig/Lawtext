import { assert } from "chai";
import { initialEnv } from "../env";
import $pointerRanges from "./$pointerRanges";

const env = initialEnv({});

describe("Test $pointerRanges", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "第四十六条において同じ。";
        const expectedErrorMessages: string[] = [];

        const expectedPointerRanges = {
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
                                        name: "第四十六条",
                                    },
                                    children: ["第四十六条"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const result = $pointerRanges.abstract().match(offset, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.json(true), null, 2));
            assert.deepStrictEqual(result.value.value.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "第三十八条の二十九、第三十八条の三十一第四項及び第六項並びに第三十八条の三十八において準用する場合を含む。";
        const expectedErrorMessages: string[] = [];

        const expectedPointerRanges = {
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
                                        name: "第三十八条の二十九",
                                    },
                                    children: ["第三十八条の二十九"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第三十八条の三十一",
                                    },
                                    children: ["第三十八条の三十一"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第四項",
                                    },
                                    children: ["第四項"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["及び"],
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
                                        targetType: "Paragraph",
                                        name: "第六項",
                                    },
                                    children: ["第六項"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["並びに"],
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
                                        name: "第三十八条の三十八",
                                    },
                                    children: ["第三十八条の三十八"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const result = $pointerRanges.abstract().match(offset, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.json(true), null, 2));
            assert.deepStrictEqual(result.value.value.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "次項第三号、第十条第一項、第十二条、第十七条、第十八条、第二十四条の二第四項、第二十七条の十三第二項第九号、第三十八条の二第一項、第七十条の五の二第一項、第七十一条の五、第七十三条第一項ただし書、第三項及び第六項並びに第百二条の十八第一項において同じ。";
        const expectedErrorMessages: string[] = [];

        const expectedPointerRanges = {
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
                                        relPos: "NEXT",
                                        targetType: "Paragraph",
                                        name: "次項",
                                    },
                                    children: ["次項"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Item",
                                        name: "第三号",
                                    },
                                    children: ["第三号"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第十条",
                                    },
                                    children: ["第十条"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第一項",
                                    },
                                    children: ["第一項"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第十二条",
                                    },
                                    children: ["第十二条"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第十七条",
                                    },
                                    children: ["第十七条"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第十八条",
                                    },
                                    children: ["第十八条"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第二十四条の二",
                                    },
                                    children: ["第二十四条の二"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第四項",
                                    },
                                    children: ["第四項"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第二十七条の十三",
                                    },
                                    children: ["第二十七条の十三"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第二項",
                                    },
                                    children: ["第二項"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Item",
                                        name: "第九号",
                                    },
                                    children: ["第九号"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第三十八条の二",
                                    },
                                    children: ["第三十八条の二"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第一項",
                                    },
                                    children: ["第一項"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第七十条の五の二",
                                    },
                                    children: ["第七十条の五の二"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第一項",
                                    },
                                    children: ["第一項"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第七十一条の五",
                                    },
                                    children: ["第七十一条の五"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第七十三条",
                                    },
                                    children: ["第七十三条"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第一項",
                                    },
                                    children: ["第一項"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "PROVISO",
                                        name: "ただし書",
                                    },
                                    children: ["ただし書"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        targetType: "Paragraph",
                                        name: "第三項",
                                    },
                                    children: ["第三項"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["及び"],
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
                                        targetType: "Paragraph",
                                        name: "第六項",
                                    },
                                    children: ["第六項"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["並びに"],
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
                                        name: "第百二条の十八",
                                    },
                                    children: ["第百二条の十八"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第一項",
                                    },
                                    children: ["第一項"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const result = $pointerRanges.abstract().match(offset, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.json(true), null, 2));
            assert.deepStrictEqual(result.value.value.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "この号、第三十八条の三第一項第二号及び第三十八条の八第二項において";
        const expectedErrorMessages: string[] = [];

        const expectedPointerRanges = {
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
                                        relPos: "HERE",
                                        targetType: "Item",
                                        name: "この号",
                                    },
                                    children: ["この号"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第三十八条の三",
                                    },
                                    children: ["第三十八条の三"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第一項",
                                    },
                                    children: ["第一項"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Item",
                                        name: "第二号",
                                    },
                                    children: ["第二号"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["及び"],
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
                                        name: "第三十八条の八",
                                    },
                                    children: ["第三十八条の八"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第二項",
                                    },
                                    children: ["第二項"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const result = $pointerRanges.abstract().match(offset, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.json(true), null, 2));
            assert.deepStrictEqual(result.value.value.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "第七十一条の三の二第四項第四号イにおいて同じ。";
        const expectedErrorMessages: string[] = [];

        const expectedPointerRanges = {
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
                                        name: "第七十一条の三の二",
                                    },
                                    children: ["第七十一条の三の二"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第四項",
                                    },
                                    children: ["第四項"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Item",
                                        name: "第四号",
                                    },
                                    children: ["第四号"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "SUBITEM",
                                        name: "イ",
                                    },
                                    children: ["イ"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const result = $pointerRanges.abstract().match(offset, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.json(true), null, 2));
            assert.deepStrictEqual(result.value.value.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "前項、第三十八条の二の二第一項から第三項まで及び第三十八条の三第一項";
        const expectedErrorMessages: string[] = [];

        const expectedPointerRanges = {
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
                                        relPos: "PREV",
                                        targetType: "Paragraph",
                                        name: "前項",
                                    },
                                    children: ["前項"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第三十八条の二の二",
                                    },
                                    children: ["第三十八条の二の二"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第一項",
                                    },
                                    children: ["第一項"],
                                },
                            ],
                        },
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["から"],
                        },
                        {
                            tag: "____Pointer",
                            attr: {},
                            children: [
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第三項",
                                    },
                                    children: ["第三項"],
                                },
                            ],
                        },
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["まで"],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["及び"],
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
                                        name: "第三十八条の三",
                                    },
                                    children: ["第三十八条の三"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第一項",
                                    },
                                    children: ["第一項"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const result = $pointerRanges.abstract().match(offset, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.json(true), null, 2));
            assert.deepStrictEqual(result.value.value.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "第七十五条第一項又は第七十六条第四項（第四号を除く。）若しくは第五項（第五号を除く。）の規定により無線局の免許の取消しを受け、その取消しの日から二年を経過しない者";
        const expectedErrorMessages: string[] = [];

        const expectedPointerRanges = {
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
                                        name: "第七十五条"
                                    },
                                    children: ["第七十五条"]
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
                    children: ["又は"]
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
                                        name: "第七十六条"
                                    },
                                    children: ["第七十六条"]
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第四項"
                                    },
                                    children: ["第四項"]
                                }
                            ]
                        },
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
                                                                        targetType: "Item",
                                                                        name: "第四号"
                                                                    },
                                                                    children: ["第四号"]
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
                                            children: ["を除く。"]
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
                    ]
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["若しくは"]
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
                                        targetType: "Paragraph",
                                        name: "第五項"
                                    },
                                    children: ["第五項"]
                                }
                            ]
                        },
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
                                                                        targetType: "Item",
                                                                        name: "第五号"
                                                                    },
                                                                    children: ["第五号"]
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
                                            children: ["を除く。"]
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
                    ]
                }
            ]
        };


        const result = $pointerRanges.abstract().match(offset, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.json(true), null, 2));
            assert.deepStrictEqual(result.value.value.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "この法律又はこの法律に基づく命令の規定による書類等の提出";
        const expectedErrorMessages: string[] = [];

        const expectedPointerRanges = {
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
                                        relPos: "HERE",
                                        targetType: "Law",
                                        name: "この法律"
                                    },
                                    children: ["この法律"]
                                }
                            ]
                        }
                    ]
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["又は"]
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
                                        relPos: "HERE",
                                        targetType: "Law",
                                        name: "この法律"
                                    },
                                    children: ["この法律"]
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "INFERIOR",
                                        name: "に基づく命令"
                                    },
                                    children: ["に基づく命令"]
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        const result = $pointerRanges.abstract().match(offset, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.json(true), null, 2));
            assert.deepStrictEqual(result.value.value.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "第二十四条の二第五項各号（第二号を除く。）のいずれかに該当するに至つたとき。";
        const expectedErrorMessages: string[] = [];

        const expectedPointerRanges = {
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
                                        name: "第二十四条の二"
                                    },
                                    children: ["第二十四条の二"]
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第五項"
                                    },
                                    children: ["第五項"]
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "EACH",
                                        targetType: "Item",
                                        name: "各号"
                                    },
                                    children: ["各号"]
                                }
                            ]
                        },
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
                                                                        targetType: "Item",
                                                                        name: "第二号"
                                                                    },
                                                                    children: ["第二号"]
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
                                            children: ["を除く。"]
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
                    ]
                }
            ]
        };

        const result = $pointerRanges.abstract().match(offset, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.json(true), null, 2));
            assert.deepStrictEqual(result.value.value.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });
});
