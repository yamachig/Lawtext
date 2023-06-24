import { assert } from "chai";
import { LineType } from "../../../node/cst/line";
import { initialEnv } from "../env";
import $paragraphItemLine from "./$paragraphItemLine";
import { Controls, SentencesArray } from "../../../node/cst/inline";
import { matchResultToJson } from "generic-parser/lib/core";

const env = initialEnv({});

describe("Test $paragraphItemLine", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
  八　命令等　内閣又は行政機関が定める次に掲げるものをいう。　
    イ　法律に基づく命令（処分の要件を定める告示を含む。次条第二項において単に「命令」という。）又は規則
`;
        const expectedResult = {
            ok: true,
            nextOffset: 33,
        } as const;
        const expectedText = `\
  八　命令等　内閣又は行政機関が定める次に掲げるものをいう。　
`;
        const expectedValue = {
            type: LineType.PIT,
            indentTexts: ["  "] as string[],
            mainTag: null,
            controls: [] as Controls,
            title: "八",
            midSpace: "　",
            lineEndText: `　
`,
        } as const;
        const result = $paragraphItemLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
  # 八　命令等　内閣又は行政機関が定める次に掲げるものをいう。　
    イ　法律に基づく命令（処分の要件を定める告示を含む。次条第二項において単に「命令」という。）又は規則
`;
        const expectedResult = {
            ok: true,
            nextOffset: 35,
        } as const;
        const expectedText = `\
  # 八　命令等　内閣又は行政機関が定める次に掲げるものをいう。　
`;
        const expectedValue = {
            type: LineType.PIT,
            indentTexts: ["  "] as string[],
            mainTag: "Item",
            controls: [
                {
                    control: "#",
                    controlRange: [2, 3],
                    trailingSpace: " ",
                    trailingSpaceRange: [3, 4],
                }
            ] as Controls,
            title: "八",
            midSpace: "　",
            lineEndText: `　
`,
        } as const;
        const result = $paragraphItemLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
  :item:八　命令等　内閣又は行政機関が定める次に掲げるものをいう。　
    イ　法律に基づく命令（処分の要件を定める告示を含む。次条第二項において単に「命令」という。）又は規則
`;
        const expectedResult = {
            ok: true,
            nextOffset: 39,
        } as const;
        const expectedText = `\
  :item:八　命令等　内閣又は行政機関が定める次に掲げるものをいう。　
`;
        const expectedValue = {
            type: LineType.PIT,
            indentTexts: ["  "] as string[],
            mainTag: "Item",
            controls: [
                {
                    control: ":item:",
                    controlRange: [2, 8],
                    trailingSpace: "",
                    trailingSpaceRange: [8, 8],
                }
            ] as Controls,
            title: "八",
            midSpace: "　",
            lineEndText: `　
`,
        } as const;
        const result = $paragraphItemLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
    八　命令等　内閣又は行政機関が定める次に掲げるものをいう。　
      イ　法律に基づく命令（処分の要件を定める告示を含む。次条第二項において単に「命令」という。）又は規則
`;
        const expectedResult = {
            ok: true,
            nextOffset: 35,
        } as const;
        const expectedText = `\
    八　命令等　内閣又は行政機関が定める次に掲げるものをいう。　
`;
        const expectedValue = {
            type: LineType.PIT,
            indentTexts: ["  ", "  "] as string[],
            mainTag: null,
            controls: [] as Controls,
            title: "八",
            midSpace: "　",
            lineEndText: `　
`,
        } as const;
        const result = $paragraphItemLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
    # 八　命令等　内閣又は行政機関が定める次に掲げるものをいう。　
      イ　法律に基づく命令（処分の要件を定める告示を含む。次条第二項において単に「命令」という。）又は規則
`;
        const expectedResult = {
            ok: true,
            nextOffset: 37,
        } as const;
        const expectedText = `\
    # 八　命令等　内閣又は行政機関が定める次に掲げるものをいう。　
`;
        const expectedValue = {
            type: LineType.PIT,
            indentTexts: ["  ", "  "] as string[],
            mainTag: "Item",
            controls: [
                {
                    control: "#",
                    controlRange: [4, 5],
                    trailingSpace: " ",
                    trailingSpaceRange: [5, 6],
                }
            ] as Controls,
            title: "八",
            midSpace: "　",
            lineEndText: `　
`,
        } as const;
        const result = $paragraphItemLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
    :paragraph:八　命令等　内閣又は行政機関が定める次に掲げるものをいう。　
      イ　法律に基づく命令（処分の要件を定める告示を含む。次条第二項において単に「命令」という。）又は規則
`;
        const expectedResult = {
            ok: true,
            nextOffset: 46,
        } as const;
        const expectedText = `\
    :paragraph:八　命令等　内閣又は行政機関が定める次に掲げるものをいう。　
`;
        const expectedValue = {
            type: LineType.PIT,
            indentTexts: ["  ", "  "] as string[],
            mainTag: "Paragraph",
            controls: [
                {
                    control: ":paragraph:",
                    controlRange: [4, 15],
                    trailingSpace: "",
                    trailingSpaceRange: [15, 15],
                }
            ] as Controls,
            title: "八",
            midSpace: "　",
            lineEndText: `　
`,
        } as const;
        const result = $paragraphItemLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
  八
    イ　法律に基づく命令（処分の要件を定める告示を含む。次条第二項において単に「命令」という。）又は規則
`;
        const expectedResult = {
            ok: true,
            nextOffset: 4,
        } as const;
        const expectedText = `\
  八
`;
        const expectedValue = {
            type: LineType.PIT,
            indentTexts: ["  "] as string[],
            mainTag: null,
            controls: [] as Controls,
            title: "八",
            midSpace: "",
            sentencesArray: [] as SentencesArray,
            lineEndText: `
`,
        } as const;
        const result = $paragraphItemLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
    ロ　地方公共団体の機関（議会を除く。）
  六　行政指導　行政機関がその任務又は所掌事務の範囲内において一定の行政目的を実現するため特定の者に一定の作為又は不作為を求める指導、勧告、助言その他の行為であって処分に該当しないものをいう。
`;
        const expectedResult = {
            ok: true,
            nextOffset: 24,
        } as const;
        const expectedText = `\
    ロ　地方公共団体の機関（議会を除く。）
`;
        const expectedValue = {
            type: LineType.PIT,
            indentTexts: ["  ", "  "] as string[],
            mainTag: null,
            controls: [] as Controls,
            title: "ロ",
            midSpace: "　",
            lineEndText: `
`,
        } as const;
        const result = $paragraphItemLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
    イ～ハ　略
`;
        const expectedResult = {
            ok: true,
            nextOffset: 10,
        } as const;
        const expectedText = `\
    イ～ハ　略
`;
        const expectedValue = {
            type: LineType.PIT,
            indentTexts: ["  ", "  "] as string[],
            mainTag: null,
            controls: [] as Controls,
            title: "イ～ハ",
            midSpace: "　",
            lineEndText: `
`,
        } as const;
        const result = $paragraphItemLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
②　命令等　内閣又は行政機関が定める次に掲げるものをいう。
`;
        const expectedResult = {
            ok: true,
            nextOffset: 30,
        } as const;
        const expectedText = `\
②　命令等　内閣又は行政機関が定める次に掲げるものをいう。
`;
        const expectedValue = {
            type: LineType.PIT,
            indentTexts: [] as string[],
            mainTag: null,
            controls: [] as Controls,
            title: "②",
            midSpace: "　",
            lineEndText: `
`,
        } as const;
        const result = $paragraphItemLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
  # ②　命令等　内閣又は行政機関が定める次に掲げるものをいう。
`;
        const expectedResult = {
            ok: true,
            nextOffset: 34,
        } as const;
        const expectedText = `\
  # ②　命令等　内閣又は行政機関が定める次に掲げるものをいう。
`;
        const expectedValue = {
            type: LineType.PIT,
            indentTexts: ["  "] as string[],
            mainTag: "Paragraph",
            controls: [
                {
                    control: "#",
                    controlRange: [2, 3],
                    trailingSpace: " ",
                    trailingSpaceRange: [3, 4],
                }
            ] as Controls,
            title: "②",
            midSpace: "　",
            lineEndText: `
`,
        } as const;
        const result = $paragraphItemLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
        }
    });

    it("Fail case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
`;
        const expectedResult = {
            ok: false,
            offset: 0,
            expected: "paragraphItemLine",
        } as const;
        const result = $paragraphItemLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
    });
});
