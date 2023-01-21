import * as gp from "generic-parser";
import { ErrorMessage } from "../../parser/cst/error";
import { toplevelContainerTags, articlesContainerTags } from "../../node/container";
import * as std from "../../law/std";
import { LawIDStruct, parseLawID, ptnLawID } from "../../law/lawID";
import { Empty, Rule } from "generic-parser";

const makeEnv = () => gp.makeStringEnv();
const factory = new gp.RuleFactory<string, ReturnType<typeof makeEnv>>();
export type ValueRule<TValue> = Rule<string, TValue, ReturnType<typeof makeEnv>, Empty>;

// e.g. `405AC0000000088`, `405AC0000000088_20240401_504AC0100000052`
export interface PathFragmentLaw {
    type: "LAW",
    text: string,
    lawIDStruct: LawIDStruct,
    revision: {
        date: string,
        lawIDStruct: LawIDStruct,
    } | null,
}

const ptnAnyLawIDInner = Object.values(ptnLawID).map(s => s.replace(/\(\?<\w+>/g, "(")).map(s => `(?:${s})`).join("|");
const reAnyLawID = new RegExp(`^(?:${ptnAnyLawIDInner})`);

const $lawID: ValueRule<LawIDStruct> = factory
    .sequence(s => s
        .and(r => r
            .sequence(s => s
                .and(r => r
                    .sequence(s => s
                        .andOmit(r => r.regExp(reAnyLawID), "lawID")
                        .action(({ lawID }) => parseLawID(lawID))
                    )
                , "lawID")
                .andOmit(r => r.assert(({ lawID }) => lawID))
                .action(({ lawID }) => lawID as LawIDStruct)
            )
        )
    )
    ;

const $fragmentLaw: ValueRule<PathFragmentLaw> = factory
    .sequence(s => s
        .and(() => $lawID, "lawIDStruct")
        .and(r => r.zeroOrOne(r => r
            .sequence(s => s
                .and(r => r.seqEqual("_"))
                .and(r => r.regExp(/^\d{8}/), "date")
                .and(r => r.seqEqual("_"))
                .and(() => $lawID, "lawIDStruct")
                .action(({ date, lawIDStruct }) => ({ date, lawIDStruct }))
            )
        ), "revision")
        .action(({ text, lawIDStruct, revision }) => ({
            type: "LAW" as const,
            text: text(),
            lawIDStruct,
            revision,
        }))
    )
    ;

const $equalsNum = factory
    .sequence(s => s
        .andOmit(r => r.seqEqual("="))
        // eslint-disable-next-line no-irregular-whitespace
        .and(r => r.regExp(/^[^/ 　\t]+/))
    )
    ;

const $suareBracketsAttr = factory
    .sequence(s => s
        // .andOmit(r => r.assert(({ offset, target }) => { console.log({ offset: offset(), target: target() }); return true; }))
        .andOmit(r => r.seqEqual("["))
        // eslint-disable-next-line no-irregular-whitespace
        .and(r => r.regExp(/^[^/ 　\t=[\]"]+/), "key")
        .andOmit(r => r.seqEqual("="))
        .and(r => r
            .sequence(s => s
                .andOmit(r => r.seqEqual("\""))
            // eslint-disable-next-line no-irregular-whitespace
                .and(r => r.regExp(/^[^/ 　\t=[\]"]+/))
                .andOmit(r => r.seqEqual("\""))
            )
        , "value")
        .andOmit(r => r.seqEqual("]"))
        .action(({ key, value }) => ({ key, value } as const))
    )
    ;

// e.g. `sp`, `AppdxTable=1`, `AppdxTable[Num="1"]`
export interface PathFragmentTopLevel {
    type: "TOPLEVEL",
    text: string,
    tag: (typeof toplevelContainerTags)[number],
    num: string | null,
    attr: {
        key: string,
        value: string,
    }[],
}

const topLevelAlias = {
    "sp": "SupplProvision" as const,
    ...(Object.fromEntries(toplevelContainerTags.map(s => [s, s])) as {[K in typeof toplevelContainerTags[number]]: K}),
};

const $fragmentTopLevel: ValueRule<PathFragmentTopLevel> = factory
    .sequence(s => s
        .and(r => r.regExp(new RegExp(`^(?:${Object.keys(topLevelAlias).join("|")})`)), "topLevelKey")
        .and(r => r.zeroOrOne(() => $equalsNum), "num")
        .and(r => r.zeroOrMore(() => $suareBracketsAttr), "attr")
        .action(({ text, topLevelKey, num, attr }) => ({
            type: "TOPLEVEL" as const,
            text: text(),
            tag: topLevelAlias[topLevelKey as keyof typeof topLevelAlias],
            num,
            attr,
        }))
    )
    ;

// e.g. `Section=1`, `Section[Num="1"]`
export interface PathFragmentArticlesContainer {
    type: "ARTICLES",
    text: string,
    tag: (typeof articlesContainerTags)[number],
    num: string | null,
    attr: {
        key: string,
        value: string,
    }[],
}

const $fragmentArticlesContainer: ValueRule<PathFragmentArticlesContainer> = factory
    .sequence(s => s
        .and(r => r.regExp(new RegExp(`^(?:${articlesContainerTags.join("|")})`)), "tag")
        .and(r => r.zeroOrOne(() => $equalsNum), "num")
        .and(r => r.zeroOrMore(() => $suareBracketsAttr), "attr")
        .action(({ text, tag, num, attr }) => ({
            type: "ARTICLES" as const,
            text: text(),
            tag: tag as typeof articlesContainerTags[number],
            num,
            attr,
        }))
    )
    ;

// e.g. `a=1`, `Article=1`, `Article[Num="1"]`
export interface PathFragmentSentencesContainer {
    type: "SENTENCES",
    text: string,
    tag: "Article" | (typeof std.paragraphItemTags)[number],
    num: string | null,
    attr: {
        key: string,
        value: string,
    }[],
}

const sentencesContainerAlias = {
    "a": "Article" as const,
    "p": "Paragraph" as const,
    "i": "Item" as const,
    "si1": "Subitem1" as const,
    "si2": "Subitem2" as const,
    "si3": "Subitem3" as const,
    "si4": "Subitem4" as const,
    "si5": "Subitem5" as const,
    "si6": "Subitem6" as const,
    "si7": "Subitem7" as const,
    "si8": "Subitem8" as const,
    "si9": "Subitem9" as const,
    "si10": "Subitem10" as const,
    "Article": "Article" as const,
    ...(Object.fromEntries(std.paragraphItemTags.map(s => [s, s])) as {[K in typeof std.paragraphItemTags[number]]: K}),
};

const $fragmentSentencesContainer: ValueRule<PathFragmentSentencesContainer> = factory
    .sequence(s => s
        .andOmit(r => r.nextIsNot(r => r.regExp(new RegExp(`^(?:${Object.keys(topLevelAlias).join("|")})`))))
        .and(r => r.regExp(new RegExp(`^(?:${Object.keys(sentencesContainerAlias).join("|")})`)), "sentencesContainerKey")
        .and(r => r.zeroOrOne(() => $equalsNum), "num")
        .and(r => r.zeroOrMore(() => $suareBracketsAttr), "attr")
        .action(({ text, sentencesContainerKey, num, attr }) => ({
            type: "SENTENCES" as const,
            text: text(),
            tag: sentencesContainerAlias[sentencesContainerKey as keyof typeof sentencesContainerAlias],
            num,
            attr,
        }))
    )
    ;

export type PathFragment = PathFragmentLaw | PathFragmentTopLevel | PathFragmentArticlesContainer | PathFragmentSentencesContainer;

const $fragment: ValueRule<PathFragment> = factory
    .choice(s => s
        .or(() => $fragmentSentencesContainer)
        .or(() => $fragmentArticlesContainer)
        .or(() => $fragmentTopLevel)
        .or(() => $fragmentLaw)
    )
    ;

const $path: ValueRule<PathFragment[]> = factory
    .sequence(s => s
        .and(() => $fragment, "first")
        .and(r => r.zeroOrMore(r => r
            .sequence(s => s
                .andOmit(r => r.seqEqual("/"))
                .and(() => $fragment)
            )
        ), "rest")
        .action(({ first, rest }) => [first, ...rest])
    )
    ;

export interface ParseSuccess {
    ok: true,
    value: PathFragment[],
}

export interface ParseFail {
    ok: false,
    errors: ErrorMessage[],
}

export type ParseResult = ParseSuccess | ParseFail;

export const parse = (text: string): ParseResult => {
    const m = $path.match(0, text, makeEnv());
    if (m.ok) {
        if (m.nextOffset === text.length) {
            return {
                ok: true,
                value: m.value,
            };
        } else {
            return {
                ok: false,
                errors: [new ErrorMessage("Cannot parse the path", [m.nextOffset, text.length])],
            };
        }
    } else {
        return {
            ok: false,
            errors: [new ErrorMessage("Cannot parse the path", [0, text.length])],
        };
    }
};
export default parse;
