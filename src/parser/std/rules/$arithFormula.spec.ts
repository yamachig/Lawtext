import { testLawtextToStd } from "../testHelper";
import $arithFormula, { arithFormulaToLines } from "./$arithFormula";

describe("Test $arithFormula and arithFormulaToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:arith-formula:

  Ｐｃ′／Ｐｃ×０．８＋Ｐｉ′／Ｐｉ×０．２

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:arith-formula:
  Ｐｃ′／Ｐｃ×０．８＋Ｐｉ′／Ｐｉ×０．２
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "ArithFormula",
            attr: {},
            children: [
                {
                    tag: "Sentence",
                    attr: {},
                    children: ["Ｐｃ′／Ｐｃ×０．８＋Ｐｉ′／Ｐｉ×０．２"],
                },
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => $arithFormula.match(0, vlines, env),
            el => arithFormulaToLines(el, []),
        );
    });
});
