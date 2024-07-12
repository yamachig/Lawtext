import { assert } from "chai";
import type { LawIDStructAct, LawIDStructCabinetOrder, LawIDStructConstitution, LawIDStructDajokanFukoku, LawIDStructDajokanFutatsu, LawIDStructDajokanTasshi, LawIDStructImperialOrder, LawIDStructJinji, LawIDStructMinisterialOrdinance, LawIDStructPrimeMinisterDecision, LawIDStructRule } from "./lawID";
import { LawIDActCategory, LawIDCabinetOrderEffect, LawIDType, parseLawID } from "./lawID";
import { Era } from "./std";
import { assertLoader } from "../../test/prepareTest";
import type { LawInfo } from "../data/lawinfo";


describe("Test parseLawID", () => {

    it("Test parseLawID", async function () {

        this.slow(250);

        const loader = assertLoader(this);
        const { lawInfos } = await loader.cacheLawListStruct();

        const failedLawInfos: LawInfo[] = [];
        for (const lawInfo of lawInfos) {
            const result = parseLawID(lawInfo.LawID);
            if (!result) failedLawInfos.push(lawInfo);
        }
        if (failedLawInfos.length !== 0) {
            assert.strictEqual(failedLawInfos.map(l => l.LawID), []);
        }
    });

    it("Success case (Constitution)", () => {
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

    it("Fail case (Constitution)", () => {
        const text = "321CONSTITUTION!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case (Act)", () => {
        const text = "335AC0000000105";
        const expected: LawIDStructAct = {
            text,
            type: LawIDType.Act,
            era: Era.Showa,
            year: "35",
            category: LawIDActCategory.Cabinet,
            rawNum: "105",
            num: "105",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case (Act)", () => {
        const text = "335AC0000000105!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case (CabinetOrder)", () => {
        const text = "415CO0000000263";
        const expected: LawIDStructCabinetOrder = {
            text,
            type: LawIDType.CabinetOrder,
            era: Era.Heisei,
            year: "15",
            category: LawIDCabinetOrderEffect.CabinetOrder,
            rawNum: "263",
            num: "263",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case (CabinetOrder)", () => {
        const text = "415CO0000000263!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case (ImperialOrder)", () => {
        const text = "318IO0000000618";
        const expected: LawIDStructImperialOrder = {
            text,
            type: LawIDType.ImperialOrder,
            era: Era.Showa,
            year: "18",
            category: LawIDCabinetOrderEffect.CabinetOrder,
            rawNum: "618",
            num: "618",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case (ImperialOrder)", () => {
        const text = "318IO0000000618!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case (DajokanFukoku)", () => {
        const text = "105DF0000000337";
        const expected: LawIDStructDajokanFukoku = {
            text,
            type: LawIDType.DajokanFukoku,
            era: Era.Meiji,
            year: "05",
            category: LawIDCabinetOrderEffect.CabinetOrder,
            rawNum: "337",
            num: "337",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case (DajokanFukoku)", () => {
        const text = "105DF0000000337!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case (DajokanTasshi)", () => {
        const text = "110DT0000000097";
        const expected: LawIDStructDajokanTasshi = {
            text,
            type: LawIDType.DajokanTasshi,
            era: Era.Meiji,
            year: "10",
            category: LawIDCabinetOrderEffect.CabinetOrder,
            rawNum: "097",
            num: "97",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case (DajokanTasshi)", () => {
        const text = "110DT0000000097!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case (DajokanFutatsu)", () => {
        const text = "106DH0000000016";
        const expected: LawIDStructDajokanFutatsu = {
            text,
            type: LawIDType.DajokanFutatsu,
            era: Era.Meiji,
            year: "06",
            category: LawIDCabinetOrderEffect.CabinetOrder,
            rawNum: "016",
            num: "16",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case (DajokanFutatsu)", () => {
        const text = "106DH0000000016!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case (MinisterialOrdinance)", () => {
        const text = "427M60001080001";
        const expected: LawIDStructMinisterialOrdinance = {
            text,
            type: LawIDType.MinisterialOrdinance,
            era: Era.Heisei,
            year: "27",
            category: "60001080",
            rawNum: "001",
            num: "1",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case (MinisterialOrdinance)", () => {
        const text = "427M60001080001!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case (Jinji)", () => {
        const text = "333RJNJ09024000";
        const expected: LawIDStructJinji = {
            text,
            type: LawIDType.Jinji,
            era: Era.Showa,
            year: "33",
            rawNumPart1: "09",
            rawNumPart2: "024",
            rawNumPart3: "000",
            num: "9_24",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case (Jinji)", () => {
        const text = "333RJNJ09024000!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case (Jinji)", () => {
        const text = "427RJNJ09017142";
        const expected: LawIDStructJinji = {
            text,
            type: LawIDType.Jinji,
            era: Era.Heisei,
            year: "27",
            rawNumPart1: "09",
            rawNumPart2: "017",
            rawNumPart3: "142",
            num: "9_17_142",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case (Jinji)", () => {
        const text = "427RJNJ09017142!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case (Rule)", () => {
        const text = "322R00000001001";
        const expected: LawIDStructRule = {
            text,
            type: LawIDType.Rule,
            era: Era.Showa,
            year: "22",
            category: "00000001",
            rawNum: "001",
            num: "1",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case (Rule)", () => {
        const text = "322R00000001001!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case (PrimeMinisterDecision)", () => {
        const text = "427RPMD10100000";
        const expected: LawIDStructPrimeMinisterDecision = {
            text,
            type: LawIDType.PrimeMinisterDecision,
            era: Era.Heisei,
            year: "27",
            date: "1010",
            rawNum: "0000",
            num: "",
        };
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case (PrimeMinisterDecision)", () => {
        const text = "427RPMD10100000!";
        const expected = null;
        const actual = parseLawID(text);
        assert.deepStrictEqual(actual, expected);
    });

});
