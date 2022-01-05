import { assert } from "chai";
import { LineType } from "../../../node/cst/line";
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
        const expectedText = `\
      附　則　
`;
        const expectedValue = {
            type: LineType.SPR,
            indentDepth: 3,
            indentTexts: ["  ", "  ", "  "] as string[],
            head: "附　則",
            openParen: "",
            amendLawNum: "",
            closeParen: "",
            extractText: "",
            lineEndText: `　
`,
        } as const;
        const result = $supplProvisionHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
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
        const expectedText = `\
      附　則（平成二六年六月一三日法律第七〇号）　抄
`;
        const expectedValue = {
            type: LineType.SPR,
            indentDepth: 3,
            indentTexts: ["  ", "  ", "  "] as string[],
            head: "附　則",
            openParen: "（",
            amendLawNum: "平成二六年六月一三日法律第七〇号",
            closeParen: "）",
            extractText: "　抄",
            lineEndText: `
`,
        } as const;
        const result = $supplProvisionHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
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
        const expectedText = `\
      附　則（平成二六年六月一三日法律第七〇号）　
`;
        const expectedValue = {
            type: LineType.SPR,
            indentDepth: 3,
            indentTexts: ["  ", "  ", "  "] as string[],
            head: "附　則",
            openParen: "（",
            amendLawNum: "平成二六年六月一三日法律第七〇号",
            closeParen: "）",
            extractText: "",
            lineEndText: `　
`,
        } as const;
        const result = $supplProvisionHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
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
