import { assert } from "chai";
import { LawIDActCategory, LawIDCabinetOrderEffect, LawIDStructAct, LawIDStructCabinetOrder, LawIDStructConstitution, LawIDStructDajokanFukoku, LawIDStructDajokanFutatsu, LawIDStructDajokanTasshi, LawIDStructImperialOrder, LawIDStructJinji, LawIDStructMinisterialOrdinance, LawIDStructPrimeMinisterDecision, LawIDStructRule, LawIDType, parseLawID } from "./lawID";
import { Era } from "./num";


describe("Test parseLawID", () => {

    it("Success case", () => {
        const text = "321CONSTITUTION";
        const expected: LawIDStructConstitution = {
            text,
            type: LawIDType.Constitution,
            era: Era.Showa,
            year: "21",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case", () => {
        const text = "321CONSTITUTION!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "335AC0000000105";
        const expected: LawIDStructAct = {
            text,
            type: LawIDType.Act,
            era: Era.Showa,
            year: "35",
            category: LawIDActCategory.Cabinet,
            num: "105",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case", () => {
        const text = "335AC0000000105!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "415CO0000000263";
        const expected: LawIDStructCabinetOrder = {
            text,
            type: LawIDType.CabinetOrder,
            era: Era.Heisei,
            year: "15",
            category: LawIDCabinetOrderEffect.CabinetOrder,
            num: "263",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case", () => {
        const text = "415CO0000000263!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "318IO0000000618";
        const expected: LawIDStructImperialOrder = {
            text,
            type: LawIDType.ImperialOrder,
            era: Era.Showa,
            year: "18",
            category: LawIDCabinetOrderEffect.CabinetOrder,
            num: "618",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case", () => {
        const text = "318IO0000000618!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "105DF0000000337";
        const expected: LawIDStructDajokanFukoku = {
            text,
            type: LawIDType.DajokanFukoku,
            era: Era.Meiji,
            year: "05",
            category: LawIDCabinetOrderEffect.CabinetOrder,
            num: "337",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case", () => {
        const text = "105DF0000000337!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "110DT0000000097";
        const expected: LawIDStructDajokanTasshi = {
            text,
            type: LawIDType.DajokanTasshi,
            era: Era.Meiji,
            year: "10",
            category: LawIDCabinetOrderEffect.CabinetOrder,
            num: "097",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case", () => {
        const text = "110DT0000000097!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "106DH0000000016";
        const expected: LawIDStructDajokanFutatsu = {
            text,
            type: LawIDType.DajokanFutatsu,
            era: Era.Meiji,
            year: "06",
            category: LawIDCabinetOrderEffect.CabinetOrder,
            num: "016",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case", () => {
        const text = "106DH0000000016!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "427M60001080001";
        const expected: LawIDStructMinisterialOrdinance = {
            text,
            type: LawIDType.MinisterialOrdinance,
            era: Era.Heisei,
            year: "27",
            category: "60001080",
            num: "001",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case", () => {
        const text = "427M60001080001!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "333RJNJ09024000";
        const expected: LawIDStructJinji = {
            text,
            type: LawIDType.Jinji,
            era: Era.Showa,
            year: "33",
            num1: "09",
            num2: "024",
            num3: "000",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case", () => {
        const text = "333RJNJ09024000!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "322R00000001001";
        const expected: LawIDStructRule = {
            text,
            type: LawIDType.Rule,
            era: Era.Showa,
            year: "22",
            category: "00000001",
            num: "001",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case", () => {
        const text = "322R00000001001!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "427RPMD10100000";
        const expected: LawIDStructPrimeMinisterDecision = {
            text,
            type: LawIDType.PrimeMinisterDecision,
            era: Era.Heisei,
            year: "27",
            date: "1010",
            num: "0000",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case", () => {
        const text = "427RPMD10100000!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

});
