import * as gp from "generic-parser";
import { ErrorMessage } from "../../parser/cst/error";
import { articlesContainerTags } from "../../node/container";
import { LawIDStruct, parseLawID, ptnLawID } from "../../law/lawID";
import { Empty, Rule } from "generic-parser";
import { PathFragment, PathFragmentArticlesContainer, PathFragmentLaw, PathFragmentSentencesContainer, PathFragmentTopLevel, sentencesContainerAlias, topLevelAlias } from "./common";

const makeEnv = () => gp.makeStringEnv();
const factory = new gp.RuleFactory<string, ReturnType<typeof makeEnv>>();
export type ValueRule<TValue> = Rule<string, TValue, ReturnType<typeof makeEnv>, Empty>;

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

const $suareBracketsNth = factory
    .sequence(s => s
        .andOmit(r => r.seqEqual("["))
        .and(r => r.regExp(/^\d+/))
        .andOmit(r => r.seqEqual("]"))
    )
    ;

const $fragmentTopLevel: ValueRule<PathFragmentTopLevel> = factory
    .sequence(s => s
        .and(r => r.regExp(new RegExp(`^(?:${Object.keys(topLevelAlias).join("|")})`)), "topLevelKey")
        .and(r => r.zeroOrOne(() => $equalsNum), "num")
        .and(r => r.zeroOrMore(() => $suareBracketsAttr), "attr")
        .and(r => r.zeroOrOne(() => $suareBracketsNth), "nth")
        .action(({ text, topLevelKey, num, attr, nth }) => ({
            type: "TOPLEVEL" as const,
            text: text(),
            tag: topLevelAlias[topLevelKey as keyof typeof topLevelAlias],
            num,
            attr,
            nth,
        }))
    )
    ;

const $fragmentArticlesContainer: ValueRule<PathFragmentArticlesContainer> = factory
    .sequence(s => s
        .and(r => r.regExp(new RegExp(`^(?:${articlesContainerTags.join("|")})`)), "tag")
        .and(r => r.zeroOrOne(() => $equalsNum), "num")
        .and(r => r.zeroOrMore(() => $suareBracketsAttr), "attr")
        .and(r => r.zeroOrOne(() => $suareBracketsNth), "nth")
        .action(({ text, tag, num, attr, nth }) => ({
            type: "ARTICLES" as const,
            text: text(),
            tag: tag as typeof articlesContainerTags[number],
            num,
            attr,
            nth,
        }))
    )
    ;

const $fragmentSentencesContainer: ValueRule<PathFragmentSentencesContainer> = factory
    .sequence(s => s
        .andOmit(r => r.nextIsNot(r => r.regExp(new RegExp(`^(?:${Object.keys(topLevelAlias).join("|")})`))))
        .and(r => r.regExp(new RegExp(`^(?:${Object.keys(sentencesContainerAlias).join("|")})`)), "sentencesContainerKey")
        .and(r => r.zeroOrOne(() => $equalsNum), "num")
        .and(r => r.zeroOrMore(() => $suareBracketsAttr), "attr")
        .and(r => r.zeroOrOne(() => $suareBracketsNth), "nth")
        .action(({ text, sentencesContainerKey, num, attr, nth }) => ({
            type: "SENTENCES" as const,
            text: text(),
            tag: sentencesContainerAlias[sentencesContainerKey as keyof typeof sentencesContainerAlias],
            num,
            attr,
            nth,
        }))
    )
    ;

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
