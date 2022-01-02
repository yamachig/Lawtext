import { assert } from "chai";
import { LineType } from "../../../node/line";
import { initialEnv } from "../env";
import $supplProvisionHeadLine from "./$supplProvisionHeadLine";

const env = initialEnv({});

describe("Test $supplProvisionHeadLine", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
      附　則　

  （施行期日）
１　この法律は、公布の日から起算して一年を超えない範囲内において政令で定める日から施行する。
`;
        const expectedResult = {
            ok: true,
            nextOffset: 11,
        } as const;
        const expectedValue = {
            type: LineType.SPR,
            text: `\
      附　則　
`,
            indentDepth: 3,
            indentTexts: ["  ", "  ", "  "] as string[],
            contentText: "附　則",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "SupplProvision",
            attr: {},
            children: [
                {
                    tag: "SupplProvisionLabel",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["附　則"],
                        },
                    ],
                },
            ],
        };
        const result = $supplProvisionHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
      附　則（平成二六年六月一三日法律第七〇号）　抄

  （施行期日）
第一条　この法律は、平成二十七年四月一日から施行する。
`;
        const expectedResult = {
            ok: true,
            nextOffset: 30,
        } as const;
        const expectedValue = {
            type: LineType.SPR,
            text: `\
      附　則（平成二六年六月一三日法律第七〇号）　抄
`,
            indentDepth: 3,
            indentTexts: ["  ", "  ", "  "] as string[],
            contentText: "附　則（平成二六年六月一三日法律第七〇号）　抄",
            lineEndText: `
`,
        } as const;
        const expectedContent = {
            tag: "SupplProvision",
            attr: {
                AmendLawNum: "平成二六年六月一三日法律第七〇号",
                Extract: "true",
            },
            children: [
                {
                    tag: "SupplProvisionLabel",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["附　則"],
                        },
                    ],
                },
            ],
        };
        const result = $supplProvisionHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
      附　則（平成二六年六月一三日法律第七〇号）　

  （施行期日）
第一条　この法律は、平成二十七年四月一日から施行する。
`;
        const expectedResult = {
            ok: true,
            nextOffset: 29,
        } as const;
        const expectedValue = {
            type: LineType.SPR,
            text: `\
      附　則（平成二六年六月一三日法律第七〇号）　
`,
            indentDepth: 3,
            indentTexts: ["  ", "  ", "  "] as string[],
            contentText: "附　則（平成二六年六月一三日法律第七〇号）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "SupplProvision",
            attr: {
                AmendLawNum: "平成二六年六月一三日法律第七〇号",
            },
            children: [
                {
                    tag: "SupplProvisionLabel",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["附　則"],
                        },
                    ],
                },
            ],
        };
        const result = $supplProvisionHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

    it("Fail case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
附則別表第二（第十九条、第二十一条関係）

  * - 情報照会者
    - 事務
`;
        const expectedResult = {
            ok: false,
            offset: 0,
            expected: "supplProvisionHeadLine",
        } as const;
        const result = $supplProvisionHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
    });
});
