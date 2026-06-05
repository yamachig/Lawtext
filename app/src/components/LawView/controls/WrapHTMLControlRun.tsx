
import React from "react";
import type { HTMLComponentProps, WrapperComponentProps } from "lawtext/dist/src/renderer/common/html.js";
import { HTMLSentenceChildrenRun } from "lawtext/dist/src/renderer/rules/sentenceChildrenRun.js";
import type { HTMLControlRunProps } from "lawtext/dist/src/renderer/rules/controlRun.js";
import type { LawViewOptions } from "../common.tsx";
import type { SentenceChildEL } from "lawtext/dist/src/node/cst/inline.js";
import { ____Declaration } from "lawtext/dist/src/node/el/controls/declaration.js";
import { ____LawNum, ____Pointer, ____VarRef } from "lawtext/dist/src/node/el/controls/index.js";
import Declaration from "./Declaration.tsx";
import ContainersView from "./ContainersView.tsx";
import PeekView from "./PeekView.tsx";
import Pointer from "./Pointer.tsx";
import LawNum from "./LawNum.tsx";


export const WrapHTMLControlRun: React.FC<WrapperComponentProps> = props => {
    const { childProps, ChildComponent } = props;
    const { el, htmlOptions } = childProps as HTMLComponentProps & HTMLControlRunProps;

    if (el instanceof ____Declaration) {
        return <Declaration el={el} {...{ htmlOptions }} />;

    } else if (el instanceof ____VarRef) {
        const options = htmlOptions.options as LawViewOptions;
        const analysis = options.lawData.analysis;
        const sentenceChildren = el.children as (string | SentenceChildEL)[];
        if (!analysis || !el.attr.declarationID) return (<HTMLSentenceChildrenRun els={sentenceChildren} {...{ htmlOptions }} />);
        const declaration = analysis.declarations.get(el.attr.declarationID);
        const declContainer = analysis.sentenceEnvs[declaration.nameSentenceTextRange.start.sentenceIndex].container;
        const containerID = declContainer.containerID;
        const ChildComponent: React.FC<HTMLComponentProps> = props => {
            return <ContainersView containerIDs={[containerID]} {...{ htmlOptions: props.htmlOptions }} />;
        };
        return <PeekView ChildComponent={ChildComponent} sentenceChildren={sentenceChildren} {...{ htmlOptions }} />;

    } else if (el instanceof ____Pointer) {
        return <Pointer el={el} {...{ htmlOptions }} wrapperProps={props} />;

    } else if (el instanceof ____LawNum) {
        return <LawNum el={el} {...{ htmlOptions }} />;

    } else {
        return <ChildComponent {...childProps} />;
    }
};

export default WrapHTMLControlRun;
