import { assert } from "chai";
import { LawIDActCategory, LawIDType } from "../../law/lawID";
import { Era } from "../../law/std";
import type { ParseResult } from "./parse";
import parse from "./parse";

describe("Test path.v1.parse", () => {

    it("Success case", () => {
        const text = "405AC0000000088";
        const expected: ParseResult = {
            ok: true,
            value: [
                {
                    type: "LAW",
                    text: "405AC0000000088",
                    lawIDStruct: {
                        text: "405AC0000000088",
                        type: LawIDType.Act,
                        era: Era.Heisei,
                        year: "05",
                        category: LawIDActCategory.Cabinet,
                        rawNum: "088",
                        num: "88",
                    },
                    revision: null,
                },
            ],
        };
        const actual = parse(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "405AC0000000088_20240401_504AC0100000052";
        const expected: ParseResult = {
            ok: true,
            value: [
                {
                    type: "LAW",
                    text: "405AC0000000088_20240401_504AC0100000052",
                    lawIDStruct: {
                        text: "405AC0000000088",
                        type: LawIDType.Act,
                        era: Era.Heisei,
                        year: "05",
                        category: LawIDActCategory.Cabinet,
                        rawNum: "088",
                        num: "88",
                    },
                    revision: {
                        date: "20240401",
                        lawIDStruct: {
                            text: "504AC0100000052",
                            type: LawIDType.Act,
                            era: Era.Reiwa,
                            year: "04",
                            category: LawIDActCategory.HouseOfCouncillors,
                            rawNum: "052",
                            num: "52",
                        },
                    },
                },
            ],
        };
        const actual = parse(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "sp";
        const expected: ParseResult = {
            ok: true,
            value: [
                {
                    type: "TOPLEVEL",
                    text: "sp",
                    tag: "SupplProvision",
                    num: null,
                    attr: [],
                    nth: null,
                },
            ],
        };
        const actual = parse(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "AppdxTable=1";
        const expected: ParseResult = {
            ok: true,
            value: [
                {
                    type: "TOPLEVEL",
                    text: "AppdxTable=1",
                    tag: "AppdxTable",
                    num: "1",
                    attr: [],
                    nth: null,
                },
            ],
        };
        const actual = parse(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "AppdxTable[Num=\"1\"]";
        const expected: ParseResult = {
            ok: true,
            value: [
                {
                    type: "TOPLEVEL",
                    text: "AppdxTable[Num=\"1\"]",
                    tag: "AppdxTable",
                    num: null,
                    attr: [
                        {
                            key: "Num",
                            value: "1",
                        },
                    ],
                    nth: null,
                },
            ],
        };
        const actual = parse(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "AppdxTable[1]";
        const expected: ParseResult = {
            ok: true,
            value: [
                {
                    type: "TOPLEVEL",
                    text: "AppdxTable[1]",
                    tag: "AppdxTable",
                    num: null,
                    attr: [],
                    nth: "1",
                },
            ],
        };
        const actual = parse(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "Section=1";
        const expected: ParseResult = {
            ok: true,
            value: [
                {
                    type: "ARTICLES",
                    text: "Section=1",
                    tag: "Section",
                    num: "1",
                    attr: [],
                    nth: null,
                },
            ],
        };
        const actual = parse(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "Section[Num=\"1\"]";
        const expected: ParseResult = {
            ok: true,
            value: [
                {
                    type: "ARTICLES",
                    text: "Section[Num=\"1\"]",
                    tag: "Section",
                    num: null,
                    attr: [
                        {
                            key: "Num",
                            value: "1",
                        },
                    ],
                    nth: null,
                },
            ],
        };
        const actual = parse(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "Section[1]";
        const expected: ParseResult = {
            ok: true,
            value: [
                {
                    type: "ARTICLES",
                    text: "Section[1]",
                    tag: "Section",
                    num: null,
                    attr: [],
                    nth: "1",
                },
            ],
        };
        const actual = parse(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "a=1";
        const expected: ParseResult = {
            ok: true,
            value: [
                {
                    type: "SENTENCES",
                    text: "a=1",
                    tag: "Article",
                    num: "1",
                    attr: [],
                    nth: null,
                },
            ],
        };
        const actual = parse(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "Article=1";
        const expected: ParseResult = {
            ok: true,
            value: [
                {
                    type: "SENTENCES",
                    text: "Article=1",
                    tag: "Article",
                    num: "1",
                    attr: [],
                    nth: null,
                },
            ],
        };
        const actual = parse(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "Article[Num=\"1\"]";
        const expected: ParseResult = {
            ok: true,
            value: [
                {
                    type: "SENTENCES",
                    text: "Article[Num=\"1\"]",
                    tag: "Article",
                    num: null,
                    attr: [
                        {
                            key: "Num",
                            value: "1",
                        },
                    ],
                    nth: null,
                },
            ],
        };
        const actual = parse(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "Article[1]";
        const expected: ParseResult = {
            ok: true,
            value: [
                {
                    type: "SENTENCES",
                    text: "Article[1]",
                    tag: "Article",
                    num: null,
                    attr: [],
                    nth: "1",
                },
            ],
        };
        const actual = parse(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case", () => {
        const text = "Article[]";
        const expected: ParseResult = {
            ok: false,
            errors: [
                {
                    message: "Cannot parse the path",
                    range: [7, 9],
                },
            ],
        };
        const actual = parse(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "405AC0000000088/a=1/p=1";
        const expected: ParseResult = {
            ok: true,
            value: [
                {
                    type: "LAW",
                    text: "405AC0000000088",
                    lawIDStruct: {
                        text: "405AC0000000088",
                        type: LawIDType.Act,
                        era: Era.Heisei,
                        year: "05",
                        category: LawIDActCategory.Cabinet,
                        rawNum: "088",
                        num: "88",
                    },
                    revision: null,
                },
                {
                    type: "SENTENCES",
                    text: "a=1",
                    tag: "Article",
                    num: "1",
                    attr: [],
                    nth: null,
                },
                {
                    type: "SENTENCES",
                    text: "p=1",
                    tag: "Paragraph",
                    num: "1",
                    attr: [],
                    nth: null,
                },
            ],
        };
        const actual = parse(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Success case", () => {
        const text = "405AC0000000088/sp/a=1/p=1";
        const expected: ParseResult = {
            ok: true,
            value: [
                {
                    type: "LAW",
                    text: "405AC0000000088",
                    lawIDStruct: {
                        text: "405AC0000000088",
                        type: LawIDType.Act,
                        era: Era.Heisei,
                        year: "05",
                        category: LawIDActCategory.Cabinet,
                        rawNum: "088",
                        num: "88",
                    },
                    revision: null,
                },
                {
                    type: "TOPLEVEL",
                    text: "sp",
                    tag: "SupplProvision",
                    num: null,
                    attr: [],
                    nth: null,
                },
                {
                    type: "SENTENCES",
                    text: "a=1",
                    tag: "Article",
                    num: "1",
                    attr: [],
                    nth: null,
                },
                {
                    type: "SENTENCES",
                    text: "p=1",
                    tag: "Paragraph",
                    num: "1",
                    attr: [],
                    nth: null,
                },
            ],
        };
        const actual = parse(text);
        assert.deepStrictEqual(actual, expected);
    });

    it("Fail case", () => {
        const text = "405AC0000000088//p=1";
        const expected: ParseResult = {
            ok: false,
            errors: [
                {
                    message: "Cannot parse the path",
                    range: [15, 20],
                },
            ],
        };
        const actual = parse(text);
        assert.deepStrictEqual(actual, expected);
    });

});
