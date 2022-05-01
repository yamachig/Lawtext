
import React, { Fragment } from "react";
import * as std from "lawtext/dist/src/law/std";
import { HTMLComponentProps, HTMLMarginSpan, WrapperComponentProps } from "lawtext/dist/src/renderer/common/html";
import { HTMLSentenceChildrenRun } from "lawtext/dist/src/renderer/rules/sentenceChildrenRun";
import { HTMLControlRunProps } from "lawtext/dist/src/renderer/rules/controlRun";
import { HTMLAnyELs } from "lawtext/dist/src/renderer/rules/any";
import styled, { createGlobalStyle } from "styled-components";
import { em, LawViewOptions } from "./common";
import { EL } from "lawtext/dist/src/node/el";
import { NotImplementedError } from "lawtext/dist/src/util";
import { SentenceChildEL } from "lawtext/dist/src/node/cst/inline";
import { ____Declaration } from "lawtext/dist/src/node/el/controls/declaration";
import { ____LawNum, ____PF, ____VarRef } from "lawtext/dist/src/node/el/controls";


export const WrapHTMLControlRun: React.FC<WrapperComponentProps> = props => {
    const { childProps, ChildComponent } = props;
    const { el, htmlOptions } = childProps as HTMLComponentProps & HTMLControlRunProps;

    if (el instanceof ____Declaration) {
        return <Declaration el={el as ____Declaration} {...{ htmlOptions }} />;

    } else if (el instanceof ____VarRef) {
        const options = htmlOptions.options as LawViewOptions;
        const analysis = options.lawData.analysis;
        const sentenceChildren = el.children as (string | SentenceChildEL)[];
        if (!analysis || !el.attr.declarationID) return (<HTMLSentenceChildrenRun els={sentenceChildren} {...{ htmlOptions }} />);
        const declaration = analysis.declarations.get(el.attr.declarationID);
        const declContainer = analysis.sentenceEnvs[declaration.nameSentenceTextRange.start.sentenceIndex].container;
        const containerID = declContainer.containerID;
        return <ContainerRef containerIDs={[containerID]} sentenceChildren={sentenceChildren} {...{ htmlOptions }} />;

    } else if (el instanceof ____PF) {
        const options = htmlOptions.options as LawViewOptions;
        const analysis = options.lawData.analysis;
        const sentenceChildren = el.children as (string | SentenceChildEL)[];
        if (!analysis || el.targetContainerIDs.length === 0) return (<HTMLSentenceChildrenRun els={sentenceChildren} {...{ htmlOptions }} />);
        const containerIDs = el.targetContainerIDs;
        return <ContainerRef containerIDs={containerIDs as string[]} sentenceChildren={sentenceChildren} {...{ htmlOptions }} />;

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


const ContainerRefSpan = styled.span`
`;

const ContainerRefTextSpan = styled.span`
    border-bottom: 1px solid rgba(127, 127, 127, 0.3);
    cursor: pointer;
    transition: background-color 0.3s, border-bottom-color 0.3s;
`;

// eslint-disable-next-line no-unused-vars
enum ContainerRefFloatState {
    // eslint-disable-next-line no-unused-vars
    CLOSED,
    // eslint-disable-next-line no-unused-vars
    OPEN,
}

const ContainerRefFloatBlockInnerSpan = styled.div`
    position: relative;
    width: 100%;
    font-size: 1rem;
    padding: 0.5em;
`;

const ContainerRefArrowSpan = styled.div`
    position: absolute;
    border-style: solid;
    border-width: 0 0.5em 0.5em 0.5em;
    border-color: transparent transparent rgba(125, 125, 125) transparent;
    margin: -0.5em 0 0 0;
`;

const ContainerRefWindowSpan = styled.span`
    float: right;
    width: 100%;
    padding: 0.5em;
    border-radius: 0.2em;
    border: 1px solid rgba(125, 125, 125);
    background-color: rgba(240, 240, 240);
`;

interface ContainerRefProps { containerIDs: string[], sentenceChildren: (string | SentenceChildEL)[] }

interface ContainerRefState { mode: ContainerRefFloatState, arrowLeft: string }

const ContainerRef = (props: HTMLComponentProps & ContainerRefProps) => {
    const { containerIDs, sentenceChildren, htmlOptions } = props;


    const refText = React.useRef<HTMLSpanElement>(null);
    const refWindow = React.useRef<HTMLSpanElement>(null);

    const [state, setState] = React.useState<ContainerRefState>({ mode: ContainerRefFloatState.CLOSED, arrowLeft: "" });

    React.useEffect(() => {
        return () => {
            window.removeEventListener("resize", updateSize);
        };
    }, []);

    const varRefTextSpanOnClick = (/* e: React.MouseEvent<HTMLSpanElement> */) => {
        if (state.mode === ContainerRefFloatState.OPEN) {
            setState(prevState => ({ ...prevState, mode: ContainerRefFloatState.CLOSED }));
            window.removeEventListener("resize", updateSize);
        } else {
            setState(prevState => ({ ...prevState, mode: ContainerRefFloatState.OPEN }));
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
        <ContainerRefSpan className={state.mode === ContainerRefFloatState.OPEN ? "lawtext-container-ref-open" : undefined}>

            <ContainerRefTextSpan onClick={varRefTextSpanOnClick} ref={refText} className="lawtext-container-ref-text">
                <HTMLSentenceChildrenRun els={sentenceChildren} {...{ htmlOptions }} />
            </ContainerRefTextSpan>

            {(state.mode !== ContainerRefFloatState.CLOSED) && (
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
                        <ContainerRefFloatBlockInnerSpan>
                            <ContainerRefArrowSpan style={state.arrowLeft ? { marginLeft: state.arrowLeft } : { visibility: "hidden" }} />
                            <ContainerRefWindowSpan ref={refWindow}>
                                <PeekContainerView containerIDs={containerIDs} {...{ htmlOptions }} />
                            </ContainerRefWindowSpan>
                        </ContainerRefFloatBlockInnerSpan>
                    </div>
                </div>
            )}

        </ContainerRefSpan>
    );
};


interface PeekContainerViewProps { containerIDs: string[] }

const PeekContainerView = (props: HTMLComponentProps & PeekContainerViewProps) => {
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

