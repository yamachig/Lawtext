import { assert } from "chai";
import { initialEnv } from "../env";
import type { ErrorMessage } from "../error";
import $indents from "./$indents";

const env = initialEnv({});

describe("Test $indents", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
  （目的等）
`;
        const expected = {
            ok: true,
            nextOffset: 2,
            value: {
                value: {
                    indentDepth: 1,
                    indentTexts: ["  "] as string[],
                },
                errors: [] as ErrorMessage[],
            },
        } as const;
        const result = $indents.abstract().match(offset, target, env);
        assert.deepInclude(result, expected);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
`;
        const expected = {
            ok: true,
            nextOffset: 0,
            value: {
                value: {
                    indentDepth: 0,
                    indentTexts: [] as string[],
                },
                errors: [] as ErrorMessage[],
            },
        } as const;
        const result = $indents.abstract().match(offset, target, env);
        assert.deepInclude(result, expected);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
　  - 請求
`;
        const expected = {
            ok: true,
            nextOffset: 3,
            value: {
                value: {
                    indentDepth: 2,
                    indentTexts: ["　", "  "] as string[],
                },
                errors: [] as ErrorMessage[],
            },
        } as const;
        const result = $indents.abstract().match(offset, target, env);
        assert.deepInclude(result, expected);
    });
});
