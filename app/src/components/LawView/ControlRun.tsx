
import React, { Fragment } from "react";
import * as std from "lawtext/dist/src/law/std";
import { HTMLComponentProps, HTMLMarginSpan, WrapperComponentProps } from "lawtext/dist/src/renderer/common/html";
import { withKey } from "lawtext/dist/src/renderer/common";
import { HTMLSentenceChildrenRun } from "lawtext/dist/src/renderer/rules/sentenceChildrenRun";
import { HTMLControlRunProps } from "lawtext/dist/src/renderer/rules/controlRun";
import { HTMLAnyELs } from "lawtext/dist/src/renderer/rules/any";
import styled, { createGlobalStyle } from "styled-components";
import { em, LawViewOptions } from "./common";
import { EL } from "lawtext/dist/src/node/el";
import { NotImplementedError } from "lawtext/dist/src/util";
import { SentenceChildEL } from "lawtext/dist/src/node/cst/inline";
import { ____Declaration } from "lawtext/dist/src/node/el/controls/declaration";
import { ____LawNum, ____PF, ____Pointer, ____VarRef } from "lawtext/dist/src/node/el/controls";


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

export const ControlGlobalStyle = createGlobalStyle`
.control-parentheses-content[data-parentheses_type="square"] {
    color: rgb(158, 79, 0);
}

.lawtext-container-ref-open > .lawtext-container-ref-text {
    background-color: rgba(127, 127, 127, 0.15);
    border-bottom: 1px solid rgb(40, 167, 69);
}

.lawtext-container-ref-text:hover {
    background-color: rgb(255, 249, 160);
    border-bottom: 1px solid rgb(40, 167, 69);
}
`;


const DeclarationSpan = styled.span`
    color: rgb(40, 167, 69);
`;

interface ____DeclarationProps { el: ____Declaration }

const Declaration = (props: HTMLComponentProps & ____DeclarationProps) => {
    const { el, htmlOptions } = props;
    return (
        <DeclarationSpan>
            <HTMLSentenceChildrenRun els={el.children as (string | SentenceChildEL)[]} {...{ htmlOptions }} />
        </DeclarationSpan>
    );
};

interface ____PointerProps { el: ____Pointer, wrapperProps: WrapperComponentProps }

const Pointer = (props: HTMLComponentProps & ____PointerProps) => {
    const { el, htmlOptions, wrapperProps } = props;
    const { childProps, ChildComponent } = wrapperProps;
    const options = htmlOptions.options as LawViewOptions;
    const analysis = options.lawData.analysis;
    const pointerEnv = analysis.pointerEnvByEL.get(el);
    if (pointerEnv && pointerEnv.located) {
        const runs: JSX.Element[] = [];
        if (pointerEnv.located.type === "external") {
            // const lawNum = options.lawData.el.children.find(el => el instanceof ____LawNum)?.text();
            // if (!lawNum) throw new Error("LawNum not found");
            // const article = (el.children.find(c => (c instanceof ____PF) && c.attr.targetType === "Article") as ____PF | undefined)?.attr.name;
            // const paragraph = (el.children.find(c => (c instanceof ____PF) && c.attr.targetType === "Paragraph") as ____PF | undefined)?.attr.name;
            // const appdxTable = (el.children.find(c => (c instanceof ____PF) && c.attr.targetType === "AppdxTable") as ____PF | undefined)?.attr.name;
            // const xml = await fetchPartialLaw({ lawNum, article, paragraph, appdxTable });
            return <ChildComponent {...childProps} />;
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


const PeekViewSpan = styled.span`
`;

const PeekViewTextSpan = styled.span`
    border-bottom: 1px solid rgba(127, 127, 127, 0.3);
    cursor: pointer;
    transition: background-color 0.3s, border-bottom-color 0.3s;
`;

// eslint-disable-next-line no-unused-vars
enum PeekViewFloatState {
    // eslint-disable-next-line no-unused-vars
    CLOSED,
    // eslint-disable-next-line no-unused-vars
    OPEN,
}

const PeekViewFloatBlockInnerSpan = styled.div`
    position: relative;
    width: 100%;
    font-size: 1rem;
    padding: 0.5em;
`;

const PeekViewArrowSpan = styled.div`
    position: absolute;
    border-style: solid;
    border-width: 0 0.5em 0.5em 0.5em;
    border-color: transparent transparent rgba(125, 125, 125) transparent;
    margin: -0.5em 0 0 0;
`;

const PeekViewWindowSpan = styled.span`
    float: right;
    width: 100%;
    padding: 0.5em;
    border-radius: 0.2em;
    border: 1px solid rgba(125, 125, 125);
    background-color: rgba(240, 240, 240);
`;

interface PeekViewProps {
    ChildComponent: React.ComponentType<HTMLComponentProps>,
    sentenceChildren: (string | SentenceChildEL)[],
 }

interface PeekViewState { mode: PeekViewFloatState, arrowLeft: string }

const PeekView = (props: HTMLComponentProps & PeekViewProps) => {
    const { ChildComponent, sentenceChildren, htmlOptions } = props;


    const refText = React.useRef<HTMLSpanElement>(null);
    const refWindow = React.useRef<HTMLSpanElement>(null);

    const [state, setState] = React.useState<PeekViewState>({ mode: PeekViewFloatState.CLOSED, arrowLeft: "" });

    React.useEffect(() => {
        return () => {
            window.removeEventListener("resize", updateSize);
        };
    }, []);

    const varRefTextSpanOnClick = (/* e: React.MouseEvent<HTMLSpanElement> */) => {
        if (state.mode === PeekViewFloatState.OPEN) {
            setState(prevState => ({ ...prevState, mode: PeekViewFloatState.CLOSED }));
            window.removeEventListener("resize", updateSize);
        } else {
            setState(prevState => ({ ...prevState, mode: PeekViewFloatState.OPEN }));
            setTimeout(() => {
                updateSize();
                window.addEventListener("resize", updateSize);
            }, 0);
        }
    };

    const updateSize = () => {
        if (!refText.current || !refWindow.current) return;

        const textOffset = refText.current.getBoundingClientRect();
        const windowOffset = refWindow.current.getBoundingClientRect();

        const textLeft = textOffset ? textOffset.left : 0;
        const windowLeft = windowOffset ? windowOffset.left : 0;
        const relLeft = textLeft - windowLeft;
        const left = Math.max(relLeft, em(0.2));
        setState(prevState => ({ ...prevState, arrowLeft: `${left}px` }));
    };

    return (
        <PeekViewSpan className={state.mode === PeekViewFloatState.OPEN ? "lawtext-container-ref-open" : undefined}>

            <PeekViewTextSpan onClick={varRefTextSpanOnClick} ref={refText} className="lawtext-container-ref-text">
                <HTMLSentenceChildrenRun els={sentenceChildren} {...{ htmlOptions }} />
            </PeekViewTextSpan>

            {(state.mode !== PeekViewFloatState.CLOSED) && (
                <div
                    style={{
                        float: "right",
                        width: "100%",
                        padding: 0,
                        margin: 0,
                        textIndent: 0,
                        fontSize: 0,
                        fontWeight: "normal",
                        position: "relative",
                        color: "initial",
                    }}
                >

                    <div
                        style={{
                            width: "100%",
                            padding: 0,
                            margin: 0,
                            textIndent: 0,
                            fontSize: 0,
                            fontWeight: "normal",
                            position: "absolute",
                            color: "initial",
                        }}
                    >
                        <PeekViewFloatBlockInnerSpan>
                            <PeekViewArrowSpan style={state.arrowLeft ? { marginLeft: state.arrowLeft } : { visibility: "hidden" }} />
                            <PeekViewWindowSpan ref={refWindow}>
                                <ChildComponent {...{ htmlOptions }} />
                            </PeekViewWindowSpan>
                        </PeekViewFloatBlockInnerSpan>
                    </div>
                </div>
            )}

        </PeekViewSpan>
    );
};


interface ContainersViewProps { containerIDs: string[] }

const ContainersView = (props: HTMLComponentProps & ContainersViewProps) => {
    const { containerIDs, htmlOptions } = props;
    const options = htmlOptions.options as LawViewOptions;

    const analysis = options.lawData.analysis;
    if (!analysis) return null;

    const ret: JSX.Element[] = [];

    for (const containerID of containerIDs) {

        const container = analysis.containers.get(containerID);
        if (!container) return null;
        const containerStack = container.linealAscendant(c => {
            if (std.isParagraph(c.el)) {
                const paragraphNum = c.el.children.find(std.isParagraphNum);
                if (!c.parent) return true;
                if (
                    std.isArticle(c.parent.el) &&
                c.parent.children.filter(pc => std.isParagraph(pc.el)).length === 1 &&
                paragraphNum && paragraphNum.text() === ""
                ) {
                    return false;
                } else {
                    return true;
                }
            } else {
                return true;
            }
        });
        const names: string[] = [];

        const titleTags = [
            "LawTitle",
            "ArticleTitle",
            ...std.paragraphItemTitleTags,
            ...std.articleGroupTitleTags,
            ...std.appdxItemTitleTags,
            ...std.supplProvisionAppdxItemTitleTags,
            "SupplProvisionLabel",
            "TableStructTitle",
        ];
        const ignoreTags = ["ArticleCaption", "ParagraphCaption", ...titleTags];

        for (const c of containerStack) {
            if ((std.isLaw(container.el) || std.isMainProvision(container.el)) && std.isLaw(c.el)) {
                const lawTitle = c.el.children.find(std.isLawBody)?.children.find(std.isLawTitle);
                const lawNum = c.el.children.find(std.isLawNum);
                if (lawTitle && lawNum) {
                    names.push(`${lawTitle.text()}（${lawNum.text()}）`);
                } else if (lawTitle) {
                    names.push(lawTitle.text());
                } else if (lawNum) {
                    names.push(lawNum.text());
                }

            } else if (std.isEnactStatement(c.el)) {
                names.push("（制定文）");

            } else if (std.isArticleGroup(container.el) && std.isArticleGroup(c.el)) {
                const articleGroupTitle = (c.el.children as (typeof c.el.children)[number][])
                    .find(std.isArticleGroupTitle);
                if (articleGroupTitle) names.push(articleGroupTitle.text());

            } else if (std.isSupplProvision(c.el)) {
                const supplProvisionLabel = c.el.children
                    .find(std.isSupplProvisionLabel);
                if (supplProvisionLabel) names.push(supplProvisionLabel.text());

            } else if (std.isArticle(c.el)) {
                const articleTitle = c.el.children
                    .find(std.isArticleTitle);
                if (articleTitle) names.push(articleTitle.text());

            } else if (std.isParagraph(c.el)) {
                const paragraphNum = c.el.children
                    .find(std.isParagraphNum);
                if (paragraphNum) names.push(paragraphNum.text() || "１");

            } else if (std.isParagraphItem(c.el)) {
                const itemTitle = (c.el.children as EL[])
                    .find(std.isParagraphItemTitle);
                if (itemTitle) names.push(itemTitle.text());

            } else if (std.isTableStruct(c.el)) {
                const tableStructTitleEl = c.el.children
                    .find(std.isTableStructTitle);
                const tableStructTitle = tableStructTitleEl
                    ? tableStructTitleEl.text()
                    : "表";
                names.push(tableStructTitle + "（抜粋）");

            } else {
                continue;
            }
        }

        const containerElTitleTag = std.isMainProvision(container.el) ? "LawTitle" : titleTags
            .find(s => s.startsWith(container.el.tag));

        if (containerElTitleTag) {
            const containerEl = new EL(
                std.isMainProvision(container.el) ? "Law" : container.el.tag,
                {},
                [
                    ...(
                        (std.isLaw(container.el) || std.isMainProvision(container.el))
                            ? [new EL("LawBody", {}, [new EL("LawTitle", {}, [names.join("／")])])]
                            : [new EL(containerElTitleTag, {}, [names.join("／")])]
                    ),
                    ...(
                        (std.isLaw(container.el) || std.isMainProvision(container.el) || std.isArticleGroup(container.el) || std.isSupplProvision(container.el))
                            ? []
                            : (container.el.children as EL[])
                                .filter(child => ignoreTags.indexOf(child.tag) < 0)
                    ),
                ],
            );
            ret.push(<HTMLAnyELs els={[containerEl as std.StdEL]} indent={0} {...{ htmlOptions }} />);

        } else if (std.isEnactStatement(container.el)) {
            ret.push(
                <div style={{ paddingLeft: "1em", textIndent: "-1em" }}>
                    <span>{names.join("／")}</span>
                    <HTMLMarginSpan/>
                    <HTMLSentenceChildrenRun els={container.el.children} {...{ htmlOptions }} />
                </div>,
            );

        } else {
            throw new NotImplementedError(container.el.tag);

        }
    }
    return <>{ret.map((el, i) => <Fragment key={i}>{el}</Fragment>)}</>;
};


const LawNumA = styled.a`
`;

interface LawNumProps { el: std.__EL }

const LawNum = (props: HTMLComponentProps & LawNumProps) => {
    const { el, htmlOptions } = props;
    return (
        <LawNumA href={`#/${el.text()}`} target="_blank">
            <HTMLSentenceChildrenRun els={el.children as (string | SentenceChildEL)[]} {...{ htmlOptions }} />
        </LawNumA>
    );
};

