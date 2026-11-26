
import React from "react";
import type { HTMLComponentProps, WrapperComponentProps } from "lawtext/dist/src/renderer/common/html.js";
import { withKey } from "lawtext/dist/src/renderer/common/index.js";
import { HTMLSentenceChildrenRun } from "lawtext/dist/src/renderer/rules/sentenceChildrenRun.js";
import type { ____Pointer } from "lawtext/dist/src/node/el/controls/index.js";
import { ____PF } from "lawtext/dist/src/node/el/controls/index.js";
import PeekView from "./PeekView.tsx";
import ContainersView from "./ContainersView.tsx";
import type { ElawsPartialLawViewProps } from "./ElawsPartialLawView.tsx";
import ElawsPartialLawView, { targetPathToElm } from "./ElawsPartialLawView.tsx";
import { HTMLAnyELs } from "lawtext/dist/src/renderer/rules/any.js";
import * as std from "lawtext/dist/src/law/std/index.js";


const appdxTagByNamePrefix: [prefix: string, tag: string][] = [
    ["別表", "AppdxTable"],
    ["別記様式", "AppdxStyle"],
    ["別記書式", "AppdxFormat"],
    ["別図", "AppdxFig"],
    ["付録", "Appdx"],
];

interface ExternalTarget {
    elm: string,
    textFragments: string[],
    lawTitle?: string,
}

const getExternalTarget = (fragment: ____PF, fragmentsBefore: ____PF[]): ExternalTarget | null => {
    const targetPath = fragment.attr.targetPath;
    if (targetPath === undefined) return null;

    const resolveTag = (tag: string) => {
        if (tag !== "APPDX") return null;
        const appdxFragment = [fragment, ...fragmentsBefore].find(f => f.attr.targetType === "APPDX");
        if (!appdxFragment) return null;
        const appdxName = appdxFragment.text();
        return appdxTagByNamePrefix.find(([prefix]) => appdxName.startsWith(prefix))?.[1] ?? null;
    };
    const elm = targetPathToElm(targetPath, resolveTag);
    if (!elm) return null;

    const textFragments = fragment.attr.targetTextFragments ? JSON.parse(fragment.attr.targetTextFragments) as string[] : [];

    return {
        elm,
        textFragments,
        lawTitle: fragment.attr.targetSuggestedLawTitle,
    };
};

const getTargetContainerIDs = (fragment: ____PF): string[] | null => {
    if (fragment.attr.targetContainerID !== undefined) {
        return [fragment.attr.targetContainerID];
    } else if (fragment.attr.targetContainerIDs !== undefined) {
        return JSON.parse(fragment.attr.targetContainerIDs) as string[];
    } else {
        return null;
    }
};

const ExternalLawView = (props: HTMLComponentProps & { lawNum: string, lawTitle?: string }) => {
    const { lawNum, lawTitle, htmlOptions } = props;
    const law = std.newStdEL("Law", {}, [
        std.newStdEL("LawNum", {}, [lawNum]),
        std.newStdEL("LawBody", {}, [...(lawTitle ? [std.newStdEL("LawTitle", {}, [lawTitle])] : [])]),
    ]);
    return <HTMLAnyELs els={[law]} indent={0} htmlOptions={htmlOptions} />;
};


export interface ____PointerProps { el: ____Pointer, wrapperProps: WrapperComponentProps }

export const Pointer = (props: HTMLComponentProps & ____PointerProps) => {
    const { el, htmlOptions, wrapperProps } = props;
    const { childProps, ChildComponent } = wrapperProps;

    const fragments = el.fragments();
    const targetScope = fragments.find(f => f.attr.targetScope)?.attr.targetScope;

    if (!targetScope) {
        return <ChildComponent {...childProps} />;
    }

    const runs: React.JSX.Element[] = [];

    if (targetScope === "external") {
        let target: ExternalTarget | null = null;
        const fragmentsBefore: ____PF[] = [];
        for (const child of el.children) {
            const lawNum = (child instanceof ____PF) ? child.attr.targetLawNum : undefined;
            if (!(child instanceof ____PF) || !lawNum) {
                runs.push(<HTMLSentenceChildrenRun els={[child]} {...{ htmlOptions }} />);
                if (child instanceof ____PF) fragmentsBefore.push(child);
                continue;
            }

            // Keep the previous target if the fragment has no targetPath (e.g. "各号").
            if (child.attr.targetPath !== undefined) {
                target = getExternalTarget(child, fragmentsBefore);
            }
            fragmentsBefore.push(child);

            if (child.attr.targetType === "Law") {
                const lawTitle = child.attr.targetSuggestedLawTitle;
                const ChildComponent: React.FC<HTMLComponentProps> = props => {
                    return <ExternalLawView lawNum={lawNum} lawTitle={lawTitle} htmlOptions={props.htmlOptions} />;
                };
                runs.push(<PeekView ChildComponent={ChildComponent} sentenceChildren={child.children} {...{ htmlOptions }} />);
            } else if (target) {
                const elawsPartialLawViewProps: ElawsPartialLawViewProps = {
                    lawNum,
                    ...target,
                };
                const ChildComponent: React.FC<HTMLComponentProps> = props => {
                    return <ElawsPartialLawView {...elawsPartialLawViewProps} {...{ htmlOptions: props.htmlOptions }} />;
                };
                runs.push(<PeekView ChildComponent={ChildComponent} sentenceChildren={child.children} {...{ htmlOptions }} />);
            } else {
                runs.push(<HTMLSentenceChildrenRun els={[child]} {...{ htmlOptions }} />);
            }
        }
    } else {
        for (const child of el.children) {
            const containerIDs = (child instanceof ____PF) ? getTargetContainerIDs(child) : null;
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
};

export default Pointer;
