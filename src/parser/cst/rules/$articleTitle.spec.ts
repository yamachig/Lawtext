import { assert } from "chai";
import { initialEnv } from "../env";
import $articleTitle from "./$articleTitle";

const env = initialEnv({});

describe("Test $articleTitle", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。";
        const expectedResult = {
            ok: true,
            nextOffset: 3,
            value: "第二条",
        } as const;
        const result = $articleTitle.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "第三十六条の三　何人も、法令に違反する事実がある場合において、その是正のためにされるべき処分又は行政指導（その根拠となる規定が法律に置かれているものに限る。）がされていないと思料するときは、当該処分をする権限を有する行政庁又は当該行政指導をする権限を有する行政機関に対し、その旨を申し出て、当該処分又は行政指導をすることを求めることができる。";
        const expectedResult = {
            ok: true,
            nextOffset: 7,
            value: "第三十六条の三",
        } as const;
        const result = $articleTitle.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
    });

    it("Fail case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "第一章　総則";
        const expectedResult = {
            ok: false,
            offset: 0,
            expected: "articleTitle",
        } as const;
        const result = $articleTitle.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
    });
});
