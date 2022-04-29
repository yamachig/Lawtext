import { assert } from "chai";
import { initialEnv } from "../../../parser/cst/env";
import $pointer from "./$pointer";

const env = initialEnv({});

describe("Test $pointer", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const target = `\
第四十六条において同じ。
`;
        // const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
第四十六条
`.replace(/\r?\n$/g, "");
        const expectedValue = {
            tag: "____Pointer",
            attr: {},
            children: [
                {
                    tag: "____PF",
                    attr: {
                        relPos: "NAMED",
                        targetType: "Article",
                        name: "第四十六条",
                        num: "46",
                    },
                    children: ["第四十六条"],
                },
            ],
        };

        const result = $pointer.abstract().match(0, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.json(true), expectedValue);
            // assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

            const text = result.value.text();
            assert.strictEqual(text, expectedRendered);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const target = `\
第三十八条の二十九、第三十八条の三十一第四項及び第六項並びに第三十八条の三十八において準用する場合を含む。
`;
        // const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
第三十八条の二十九
`.replace(/\r?\n$/g, "");
        const expectedValue = {
            tag: "____Pointer",
            attr: {},
            children: [
                {
                    tag: "____PF",
                    attr: {
                        relPos: "NAMED",
                        targetType: "Article",
                        name: "第三十八条の二十九",
                        num: "38_29",
                    },
                    children: ["第三十八条の二十九"],
                },
            ],
        };

        const result = $pointer.abstract().match(0, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.json(true), expectedValue);
            // assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

            const text = result.value.text();
            assert.strictEqual(text, expectedRendered);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const target = `\
次項第三号、第十条第一項、第十二条、第十七条、第十八条、第二十四条の二第四項、第二十七条の十三第二項第九号、第三十八条の二第一項、第七十条の五の二第一項、第七十一条の五、第七十三条第一項ただし書、第三項及び第六項並びに第百二条の十八第一項において同じ。
`;
        // const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
次項第三号
`.replace(/\r?\n$/g, "");
        const expectedValue = {
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
                        num: "3",
                    },
                    children: ["第三号"],
                },
            ],
        };

        const result = $pointer.abstract().match(0, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.json(true), expectedValue);
            // assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

            const text = result.value.text();
            assert.strictEqual(text, expectedRendered);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const target = `\
この号、第三十八条の三第一項第二号及び第三十八条の八第二項において
`;
        // const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
この号
`.replace(/\r?\n$/g, "");
        const expectedValue = {
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
        };

        const result = $pointer.abstract().match(0, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.json(true), expectedValue);
            // assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

            const text = result.value.text();
            assert.strictEqual(text, expectedRendered);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const target = `\
第七十一条の三の二第四項第四号イにおいて同じ。
`;
        // const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
第七十一条の三の二第四項第四号イ
`.replace(/\r?\n$/g, "");
        const expectedValue = {
            tag: "____Pointer",
            attr: {},
            children: [
                {
                    tag: "____PF",
                    attr: {
                        relPos: "NAMED",
                        targetType: "Article",
                        name: "第七十一条の三の二",
                        num: "71_3_2",
                    },
                    children: ["第七十一条の三の二"],
                },
                {
                    tag: "____PF",
                    attr: {
                        relPos: "NAMED",
                        targetType: "Paragraph",
                        name: "第四項",
                        num: "4",
                    },
                    children: ["第四項"],
                },
                {
                    tag: "____PF",
                    attr: {
                        relPos: "NAMED",
                        targetType: "Item",
                        name: "第四号",
                        num: "4",
                    },
                    children: ["第四号"],
                },
                {
                    tag: "____PF",
                    attr: {
                        relPos: "NAMED",
                        targetType: "SUBITEM",
                        name: "イ",
                        num: "1",
                    },
                    children: ["イ"],
                },
            ],
        };

        const result = $pointer.abstract().match(0, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.json(true), expectedValue);
            // assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

            const text = result.value.text();
            assert.strictEqual(text, expectedRendered);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const target = `\
前項、第三十八条の二の二第一項から第三項まで及び第三十八条の三第一項
`;
        // const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
前項
`.replace(/\r?\n$/g, "");
        const expectedValue = {
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
        };

        const result = $pointer.abstract().match(0, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.json(true), expectedValue);
            // assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

            const text = result.value.text();
            assert.strictEqual(text, expectedRendered);
        }
    });
});
