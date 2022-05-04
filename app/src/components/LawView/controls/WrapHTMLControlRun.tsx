
import React from "react";
import { HTMLComponentProps, WrapperComponentProps } from "lawtext/dist/src/renderer/common/html";
import { HTMLSentenceChildrenRun } from "lawtext/dist/src/renderer/rules/sentenceChildrenRun";
import { HTMLControlRunProps } from "lawtext/dist/src/renderer/rules/controlRun";
import { LawViewOptions } from "../common";
import { SentenceChildEL } from "lawtext/dist/src/node/cst/inline";
import { ____Declaration } from "lawtext/dist/src/node/el/controls/declaration";
import { ____LawNum, ____Pointer, ____VarRef } from "lawtext/dist/src/node/el/controls";
import Declaration from "./Declaration";
import ContainersView from "./ContainersView";
import PeekView from "./PeekView";
import Pointer from "./Pointer";
import LawNum from "./LawNum";


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
