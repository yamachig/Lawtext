import { assert } from "chai";
import { initialEnv } from "../env";
import { ErrorMessage } from "../error";
import $articleGroupNum from "./$articleGroupNum";

const env = initialEnv({});

describe("Test $articleGroupNum", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "第一章　総則";
        const expectedResult = {
            ok: true,
            nextOffset: 3,
            value: {
                value: {
                    typeChar: "章",
                    text: "第一章",
                },
                errors: [] as ErrorMessage[],
            },
        } as const;
        const result = $articleGroupNum.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "第四章の二　処分等の求め（第三十六条の三）";
        const expectedResult = {
            ok: true,
            nextOffset: 5,
            value: {
                value: {
                    typeChar: "章",
                    text: "第四章の二",
                },
                errors: [] as ErrorMessage[],
            },
        } as const;
        const result = $articleGroupNum.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
    });

    it("Fail case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。";
        const expectedResult = {
            ok: false,
            offset: 0,
            expected: "articleGroupNum",
        } as const;
        const result = $articleGroupNum.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
    });
});
