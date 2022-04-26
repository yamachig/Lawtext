import { __Text, ____LawNum } from "../../node/el/controls";
import { ErrorMessage } from "../../parser/cst/error";
import { WithErrorValue } from "../../parser/std/util";
import { ptnLawNum } from "../../law/num";
import { SentenceChildEL } from "../../node/cst/inline";

const reLawNum = new RegExp(`${ptnLawNum}`);

export const matchLawNum = (textEL: __Text): (
    | WithErrorValue<{
        newItems: SentenceChildEL[],
        lawNum: ____LawNum,
        proceedOffset: number,
    }>
    | null
) => {
    const errors: ErrorMessage[] = [];
    const text = textEL.text();

    const match = reLawNum.exec(text);
    if (!match) return null;

    const newItems: SentenceChildEL[] = [];

    if (match.index > 0) {
        newItems.push(new __Text(
            text.substring(0, match.index),
            textEL.range && [textEL.range[0], textEL.range[0] + match.index],
        ));
    }

    const lawNum = new ____LawNum(
        match[0],
        textEL.range && [
            textEL.range[0] + match.index,
            textEL.range[0] + match.index + match[0].length,
        ],
    );
    newItems.push(lawNum);

    if (match.index + match[0].length < text.length) {
        newItems.push(new __Text(
            text.substring(match.index + match[0].length),
            textEL.range && [
                textEL.range[0] + match.index + match[0].length,
                textEL.range[1],
            ],
        ));
    }

    return {
        value: {
            newItems,
            lawNum,
            proceedOffset: match.index > 0 ? 2 : 1,
        },
        errors,
    };

};

export default matchLawNum;
