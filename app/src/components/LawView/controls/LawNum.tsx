import React from "react";
import * as std from "lawtext/dist/src/law/std";
import { HTMLComponentProps } from "lawtext/dist/src/renderer/common/html";
import styled from "styled-components";
import { HTMLSentenceChildrenRun } from "lawtext/dist/src/renderer/rules/sentenceChildrenRun";
import { SentenceChildEL } from "lawtext/dist/src/node/cst/inline";
import { toStdLawNum } from "lawtext/dist/src/law/num";


const LawNumA = styled.a`
`;

export interface LawNumProps { el: std.__EL }

export const LawNum = (props: HTMLComponentProps & LawNumProps) => {
    const { el, htmlOptions } = props;
    return (
        <LawNumA href={`#/${toStdLawNum(el.text())}`} target="_blank">
            <HTMLSentenceChildrenRun els={el.children as (string | SentenceChildEL)[]} {...{ htmlOptions }} />
        </LawNumA>
    );
};

export default LawNum;


