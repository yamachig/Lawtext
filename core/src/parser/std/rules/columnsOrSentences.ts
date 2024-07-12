import type { SentencesArray } from "../../../node/cst/inline";
import { AttrEntry, Sentences } from "../../../node/cst/inline";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { assertNever, NotImplementedError } from "../../../util";


export const columnsOrSentencesToSentencesArray = (
    els: (std.Sentence | std.Column | std.Table)[],
): SentencesArray => {

    const sentencesArray: SentencesArray = [];

    for (let i = 0; i < els.length; i++) {
        const sentences = new Sentences(
            "",
            null,
            [],
            [],
        );
        const el = els[i];

        if (el.tag === "Sentence") {
            if (el.attr.WritingMode && (el.attr.WritingMode !== std.defaultAttrs.Sentence.WritingMode)) {
                sentences.attrEntries.unshift(
                    new AttrEntry(
                        `[WritingMode="${el.attr.WritingMode}"]`,
                        ["WritingMode", el.attr.WritingMode],
                        null,
                        "",
                        null,
                    )
                );
            }
            sentences.sentences.push(el);

        } else if (el.tag === "Column") {
            sentences.leadingSpace = i === 0 ? "" : CST.MARGIN;
            if (el.attr.LineBreak && (el.attr.LineBreak !== std.defaultAttrs.Column.LineBreak)) {
                sentences.attrEntries.unshift(
                    new AttrEntry(
                        `[LineBreak="${el.attr.LineBreak}"]`,
                        ["LineBreak", el.attr.LineBreak],
                        null,
                        "",
                        null,
                    )
                );
            }
            sentences.sentences.push(...el.children);

        } else if (el.tag === "Table") {
            throw new NotImplementedError(el.tag);

        }
        else { assertNever(el); }

        sentencesArray.push(sentences);
    }

    return sentencesArray;
};

export const sentencesArrayToColumnsOrSentences = (
    sentencesArray: SentencesArray,
): (std.Sentence | std.Column)[] => {
    return sentencesArray.length === 1
        ? sentencesArray[0].sentences
        : sentencesArray.map(c => {
            const leadingSpaceRange = c.leadingSpaceRange;
            const lastSentenceRange = c.sentences.slice(-1)[0].range;
            return std.newStdEL(
                "Column",
                Object.fromEntries(c.attrEntries.map(e => e.entry)),
                c.sentences,
                (leadingSpaceRange && lastSentenceRange ? [leadingSpaceRange[0], lastSentenceRange[1]] : null),
            );
        });
};
