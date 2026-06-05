import React from "react";
import type * as std from "lawtext/dist/src/law/std/index.js";
import type { HTMLComponentProps } from "lawtext/dist/src/renderer/common/html.js";
import { styled } from "styled-components";
import { HTMLSentenceChildrenRun } from "lawtext/dist/src/renderer/rules/sentenceChildrenRun.js";
import type { SentenceChildEL } from "lawtext/dist/src/node/cst/inline.js";
import { lawNumLikeToLawNum } from "lawtext/dist/src/law/lawNum.js";


const LawNumA = styled.a`
`;

export interface LawNumProps { el: std.__EL }

export const LawNum = (props: HTMLComponentProps & LawNumProps) => {
    const { el, htmlOptions } = props;
    return (
        <LawNumA href={`#/${lawNumLikeToLawNum(el.text())}`} target="_blank">
            <HTMLSentenceChildrenRun els={el.children as (string | SentenceChildEL)[]} {...{ htmlOptions }} />
        </LawNumA>
    );
};

export default LawNum;


