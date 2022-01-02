import { assert } from "chai";
import { initialEnv } from "../env";
import $paragraphItemTitle from "./$paragraphItemTitle";

const env = initialEnv({});

describe("Test $paragraphItemTitle", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "２３　都道府県知事は、次に掲げる場合には、その旨を公示しなければならない。";
        const expectedResult = {
            ok: true,
            nextOffset: 2,
            value: "２３",
        } as const;
        const result = $paragraphItemTitle.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "十一　専ら人の学識技能に関する試験又は検定の結果についての処分";
        const expectedResult = {
            ok: true,
            nextOffset: 2,
            value: "十一",
        } as const;
        const result = $paragraphItemTitle.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "ニ　イからハまでに掲げる場合以外の場合であって行政庁が相当と認めるとき。";
        const expectedResult = {
            ok: true,
            nextOffset: 1,
            value: "ニ",
        } as const;
        const result = $paragraphItemTitle.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "（１）　遠隔自動走行を行う場所及び期間";
        const expectedResult = {
            ok: true,
            nextOffset: 3,
            value: "（１）",
        } as const;
        const result = $paragraphItemTitle.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "（ｖｉ）　運用開始の予定期日";
        const expectedResult = {
            ok: true,
            nextOffset: 4,
            value: "（ｖｉ）",
        } as const;
        const result = $paragraphItemTitle.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
    });

    it("Fail case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。";
        const expectedResult = {
            ok: false,
            offset: 0,
            expected: "paragraphItemTitle",
        } as const;
        const result = $paragraphItemTitle.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
    });
});
