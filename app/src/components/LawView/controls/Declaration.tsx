
import React from "react";
import type { HTMLComponentProps } from "lawtext/dist/src/renderer/common/html.js";
import { HTMLSentenceChildrenRun } from "lawtext/dist/src/renderer/rules/sentenceChildrenRun.js";
import { styled } from "styled-components";
import type { SentenceChildEL } from "lawtext/dist/src/node/cst/inline.js";
import type { ____Declaration } from "lawtext/dist/src/node/el/controls/declaration.js";


const DeclarationSpan = styled.span`
    color: rgb(40, 167, 69);
`;

export interface ____DeclarationProps { el: ____Declaration }

export const Declaration = (props: HTMLComponentProps & ____DeclarationProps) => {
    const { el, htmlOptions } = props;
    return (
        <DeclarationSpan>
            <HTMLSentenceChildrenRun els={el.children as (string | SentenceChildEL)[]} {...{ htmlOptions }} />
        </DeclarationSpan>
    );
};

export default Declaration;
