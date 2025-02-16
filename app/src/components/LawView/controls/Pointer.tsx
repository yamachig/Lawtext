
import React from "react";
import type { HTMLComponentProps, WrapperComponentProps } from "lawtext/dist/src/renderer/common/html";
import { withKey } from "lawtext/dist/src/renderer/common";
import { HTMLSentenceChildrenRun } from "lawtext/dist/src/renderer/rules/sentenceChildrenRun";
import type { LawViewOptions } from "../common";
import type { ____Pointer } from "lawtext/dist/src/node/el/controls";
import { ____PF } from "lawtext/dist/src/node/el/controls";
import PeekView from "./PeekView";
import ContainersView from "./ContainersView";
import type { ElawsPartialLawViewProps } from "./ElawsPartialLawView";
import ElawsPartialLawView from "./ElawsPartialLawView";
import { HTMLAnyELs } from "lawtext/dist/src/renderer/rules/any";
import * as std from "lawtext/dist/src/law/std";


export interface ____PointerProps { el: ____Pointer, wrapperProps: WrapperComponentProps }

export const Pointer = (props: HTMLComponentProps & ____PointerProps) => {
    const { el, htmlOptions, wrapperProps } = props;
    const { childProps, ChildComponent } = wrapperProps;
    const options = htmlOptions.options as LawViewOptions;
    const analysis = options.lawData.analysis;
    const pointerEnv = analysis.pointerEnvByEL.get(el);
    if (pointerEnv && pointerEnv.located) {
        const runs: React.JSX.Element[] = [];
        if (pointerEnv.located.type === "external") {
            const lawNum = pointerEnv.located.lawRef.attr.lawNum;
            if (!lawNum) {
                return <ChildComponent {...childProps} />;
            }
            let article: string|undefined = undefined;
            let paragraph: string|undefined = undefined;
            let appdxTable: string|undefined = undefined;
            let startsWithNotSupported = false;
            for (const prefix of pointerEnv.located.fqPrefixFragments.slice(0, pointerEnv.located.fqPrefixFragments.length - pointerEnv.located.skipSameCount)) {
                if (!["Law", "Article", "Paragraph", "AppdxTable"].includes(prefix.attr.targetType)) {
                    startsWithNotSupported = true;
                }
                article = (
                    (!startsWithNotSupported && prefix.attr.targetType === "Article") ? prefix.attr.name : undefined
                ) ?? article;
                paragraph = (
                    (!startsWithNotSupported && prefix.attr.targetType === "Paragraph") ? prefix.attr.name : undefined
                ) ?? paragraph;
                appdxTable = (
                    (!startsWithNotSupported && prefix.attr.targetType === "APPDX") ? prefix.attr.name : undefined
                ) ?? appdxTable;
            }
            let pfIndex = -1;
            for (const child of el.children) {
                if (child instanceof ____PF) {
                    pfIndex++;
                    const prefixOrChild = (
                        (pfIndex < pointerEnv.located.skipSameCount)
                            ? pointerEnv.located.fqPrefixFragments.find(f => f.attr.targetType === child.attr.targetType) ?? child
                            : child
                    );
                    if (!["Law", "Article", "Paragraph", "AppdxTable"].includes(prefixOrChild.attr.targetType)) {
                        startsWithNotSupported = true;
                    }

                    article = (
                        (!startsWithNotSupported && prefixOrChild.attr.targetType === "Article") ? prefixOrChild.attr.name : undefined
                    ) ?? article;
                    paragraph = (
                        (!startsWithNotSupported && prefixOrChild.attr.targetType === "Paragraph") ? prefixOrChild.attr.name : undefined
                    ) ?? paragraph;
                    appdxTable = (
                        (!startsWithNotSupported && prefixOrChild.attr.targetType === "APPDX") ? prefixOrChild.attr.name : undefined
                    ) ?? appdxTable;

                    if (child.attr.targetType === "Law") {
                        const lawTitle = pointerEnv.located.lawRef.attr.suggestedLawTitle;
                        const law = std.newStdEL("Law", {}, [
                            std.newStdEL("LawNum", {}, [lawNum]),
                            std.newStdEL("LawBody", {}, [...(lawTitle ? [std.newStdEL("LawTitle", {}, [lawTitle])] : [])]),
                        ]);
                        const ChildComponent: React.FC<HTMLComponentProps> = props => {
                            return <HTMLAnyELs els={[law]} indent={0} htmlOptions={props.htmlOptions} />;
                        };
                        return <PeekView ChildComponent={ChildComponent} sentenceChildren={child.children} {...{ htmlOptions }} />;
                    } else if (article || paragraph || appdxTable) {
                        const elawsPartialLawViewProps: ElawsPartialLawViewProps = {
                            lawTitle: pointerEnv.located.lawRef.attr.suggestedLawTitle,
                            lawNum,
                            article,
                            paragraph,
                            appdxTable,
                        };
                        const ChildComponent: React.FC<HTMLComponentProps> = props => {
                            return <ElawsPartialLawView {...elawsPartialLawViewProps} {...{ htmlOptions: props.htmlOptions }} />;
                        };
                        runs.push(<PeekView ChildComponent={ChildComponent} sentenceChildren={child.children} {...{ htmlOptions }} />);

                    } else {
                        runs.push(<HTMLSentenceChildrenRun els={[child]} {...{ htmlOptions }} />);
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
