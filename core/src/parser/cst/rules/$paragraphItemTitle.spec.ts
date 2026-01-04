import { assert } from "chai";
import { matchResultToJson } from "generic-parser/lib/core";
import { initialEnv } from "../env";
import type { ErrorMessage } from "../error";
import $paragraphItemTitle from "./$paragraphItemTitle";

const env = initialEnv({});

describe("Test $paragraphItemTitle", () => {

    it("Success case", () => {
        const offset = 0;
        const target = "２３　都道府県知事は、次に掲げる場合には、その旨を公示しなければならない。";
        const expectedResult = {
            ok: true,
            nextOffset: 2,
            value: { value: "２３", errors: [] as ErrorMessage[] },
        } as const;
        const result = $paragraphItemTitle.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
    });

    it("Success case", () => {
        const offset = 0;
        const target = "十一　専ら人の学識技能に関する試験又は検定の結果についての処分";
        const expectedResult = {
            ok: true,
            nextOffset: 2,
            value: { value: "十一", errors: [] as ErrorMessage[] },
        } as const;
        const result = $paragraphItemTitle.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
    });

    it("Success case", () => {
        const offset = 0;
        const target = "ニ　イからハまでに掲げる場合以外の場合であって行政庁が相当と認めるとき。";
        const expectedResult = {
            ok: true,
            nextOffset: 1,
            value: { value: "ニ", errors: [] as ErrorMessage[] },
        } as const;
        const result = $paragraphItemTitle.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
    });

    it("Success case", () => {
        const offset = 0;
        const target = "（１）　遠隔自動走行を行う場所及び期間";
        const expectedResult = {
            ok: true,
            nextOffset: 3,
            value: { value: "（１）", errors: [] as ErrorMessage[] },
        } as const;
        const result = $paragraphItemTitle.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
    });

    it("Success case", () => {
        const offset = 0;
        const target = "（ｖｉ）　運用開始の予定期日";
        const expectedResult = {
            ok: true,
            nextOffset: 4,
            value: { value: "（ｖｉ）", errors: [] as ErrorMessage[] },
        } as const;
        const result = $paragraphItemTitle.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
    });

    it("Fail case", () => {
        const offset = 0;
        const target = "第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。";
        const expectedResult = {
            ok: false,
            offset: 0,
            expected: "paragraphItemTitle",
        } as const;
        const result = $paragraphItemTitle.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
    });
});
