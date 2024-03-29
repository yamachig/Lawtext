
import React from "react";
import { HTMLComponentProps, WrapperComponentProps } from "lawtext/dist/src/renderer/common/html";
import { withKey } from "lawtext/dist/src/renderer/common";
import { HTMLSentenceChildrenRun } from "lawtext/dist/src/renderer/rules/sentenceChildrenRun";
import { LawViewOptions } from "../common";
import { ____PF, ____Pointer } from "lawtext/dist/src/node/el/controls";
import PeekView from "./PeekView";
import ContainersView from "./ContainersView";
import ElawsPartialLawView, { ElawsPartialLawViewProps } from "./ElawsPartialLawView";


export interface ____PointerProps { el: ____Pointer, wrapperProps: WrapperComponentProps }

export const Pointer = (props: HTMLComponentProps & ____PointerProps) => {
    const { el, htmlOptions, wrapperProps } = props;
    const { childProps, ChildComponent } = wrapperProps;
    const options = htmlOptions.options as LawViewOptions;
    const analysis = options.lawData.analysis;
    const pointerEnv = analysis.pointerEnvByEL.get(el);
    if (pointerEnv && pointerEnv.located) {
        const runs: JSX.Element[] = [];
        if (pointerEnv.located.type === "external") {
            const lawNum = pointerEnv.located.lawNum;
            if (!lawNum) {
                return <ChildComponent {...childProps} />;
            }
            let article: string|undefined = undefined;
            let paragraph: string|undefined = undefined;
            let appdxTable: string|undefined = undefined;
            for (const prefix of pointerEnv.located.fqPrefixFragments) {
                article = (
                    prefix.attr.targetType === "Article" ? prefix.attr.name : undefined
                ) ?? article;
                paragraph = (
                    prefix.attr.targetType === "Paragraph" ? prefix.attr.name : undefined
                ) ?? paragraph;
                appdxTable = (
                    prefix.attr.targetType === "AppdxTable" ? prefix.attr.name : undefined
                ) ?? appdxTable;
            }
            for (const child of el.children) {
                if (child instanceof ____PF) {
                    article = (
                        child.attr.targetType === "Article" ? child.attr.name : undefined
                    ) ?? article;
                    paragraph = (
                        child.attr.targetType === "Paragraph" ? child.attr.name : undefined
                    ) ?? paragraph;
                    appdxTable = (
                        child.attr.targetType === "AppdxTable" ? child.attr.name : undefined
                    ) ?? appdxTable;
                    if (!article && !paragraph && !appdxTable) {
                        runs.push(<HTMLSentenceChildrenRun els={[child]} {...{ htmlOptions }} />);
                    } else {
                        const elawsPartialLawViewProps: ElawsPartialLawViewProps = {
                            lawNum,
                            article,
                            paragraph,
                            appdxTable,
                        };
                        const ChildComponent: React.FC<HTMLComponentProps> = props => {
                            return <ElawsPartialLawView {...elawsPartialLawViewProps} {...{ htmlOptions: props.htmlOptions }} />;
                        };
                        runs.push(<PeekView ChildComponent={ChildComponent} sentenceChildren={child.children} {...{ htmlOptions }} />);
                    }
                } else {
                    runs.push(<HTMLSentenceChildrenRun els={[child]} {...{ htmlOptions }} />);
                }
            }
        } else {
            for (const child of el.children) {
                const containerIDs = (child instanceof ____PF) && pointerEnv.located.fragments.find(({ fragment }) => fragment === child)?.containers?.map((c) => c.containerID) || null;
                if ((child instanceof ____PF) && containerIDs) {
                    const ChildComponent: React.FC<HTMLComponentProps> = props => {
                        return <ContainersView containerIDs={containerIDs} {...{ htmlOptions: props.htmlOptions }} />;
                    };
                    runs.push(<PeekView ChildComponent={ChildComponent} sentenceChildren={child.children} {...{ htmlOptions }} />);
                } else {
                    runs.push(<HTMLSentenceChildrenRun els={[child]} {...{ htmlOptions }} />);
                }
            }
        }
        return <>
            {withKey(runs)}
        </>;

    } else {
        return <ChildComponent {...childProps} />;
    }
};

export default Pointer;
