/* eslint-disable no-irregular-whitespace */
import { SentenceChildEL } from "../../../node/cst/inline";
import { ____Pointer, ____PointerRange, ____PointerRanges } from "../../../node/el/controls/pointer";
import { ErrorMessage } from "../../../parser/cst/error";
import makeRangesRule, { RangeMaker, RangesMaker } from "./makeRangesRule";
import { rangeOfELs } from "../../../node/el";
import factory from "../factory";

const makeRange: RangeMaker<____Pointer, ____PointerRange> = (from, midText, to, trailingText) => {
    const pointerRange = new ____PointerRange({
        from,
        midChildren: midText,
        to,
        trailingChildren: trailingText,
        range: null,
    });
    pointerRange.range = rangeOfELs(pointerRange.children);
    return pointerRange;
};

const makeRanges: RangesMaker<____PointerRange, ____PointerRanges> = (first, midText, rest) => {
    const children: (____PointerRange | SentenceChildEL)[] = [];
    const errors: ErrorMessage[] = [];

    children.push(first.value);
    errors.push(...first.errors);

    children.push(...midText);

    if (rest) {
        children.push(...rest.value.children);
        errors.push(...rest.errors);
    }

    const pointerRanges = new ____PointerRanges({
        children,
        range: null,
    });
    pointerRanges.range = rangeOfELs(pointerRanges.children);

    return {
        value: pointerRanges,
        errors,
    };
};


export const reSuppressPointerRanges = /[ァ-ヿ]{2,}/yg;


export const { $ranges: $pointerRanges, $range: $pointerRange } = makeRangesRule(
    (() => factory
        .oneMatch(({ item }) => {
            if (
                (item instanceof ____Pointer)
            ) { return item; } else { return null; }
        })
    ),
    makeRange,
    makeRanges,
);

export default $pointerRanges;
