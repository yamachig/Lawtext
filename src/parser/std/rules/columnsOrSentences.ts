import { Sentences, SentencesArray } from "../../../node/cst/inline";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { assertNever, NotImplementedError } from "../../../util";


export const columnsOrSentencesToSentencesArray = (
    els: (std.Sentence | std.Column | std.Table)[],
): SentencesArray => {

    const sentencesArray: SentencesArray = [];

    for (let i = 0; i < els.length; i++) {
        const sentences: Sentences = {
            leadingSpace: "",
            attrEntries: [],
            sentences: [],
        };
        const el = els[i];

        if (el.tag === "Sentence") {
            if (el.attr.WritingMode === "horizontal") {
                sentences.attrEntries.push({
                    text: "[WritingMode=\"horizontal\"]",
                    entry: ["WritingMode", "horizontal"],
                    trailingSpace: "",
                });
            }
            sentences.sentences.push(el);

        } else if (el.tag === "Column") {
            sentences.leadingSpace = i === 0 ? "" : CST.MARGIN;
            if (el.attr.LineBreak === "true") {
                sentences.attrEntries.push({
                    text: "[LineBreak=\"true\"]",
                    entry: ["LineBreak", "true"],
                    trailingSpace: "",
                });
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
        : sentencesArray.map(c =>
            std.newStdEL(
                "Column",
                Object.fromEntries(c.attrEntries.map(e => e.entry)),
                c.sentences,
            )
        );
};
