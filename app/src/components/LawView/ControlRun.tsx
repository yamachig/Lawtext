
import React from "react";
import * as std from "lawtext/dist/src/law/std";
import { HTMLComponentProps, HTMLMarginSpan, WrapperComponentProps } from "lawtext/dist/src/renderer/common/html";
import { HTMLSentenceChildrenRun } from "lawtext/dist/src/renderer/rules/sentenceChildrenRun";
import { HTMLArticle } from "lawtext/dist/src/renderer/rules/article";
import { HTMLParagraphItem } from "lawtext/dist/src/renderer/rules/paragraphItem";
import { HTMLControlRunProps } from "lawtext/dist/src/renderer/rules/controlRun";
import { HTMLTable } from "lawtext/dist/src/renderer/rules/table";
import styled, { createGlobalStyle } from "styled-components";
import { em, LawViewOptions } from "./common";
import { EL } from "lawtext/dist/src/node/el";
import { NotImplementedError } from "lawtext/dist/src/util";
import AnimateHeight from "react-animate-height";
import { SentenceChildEL } from "lawtext/dist/src/node/cst/inline";
import { ____Declaration } from "lawtext/dist/src/node/el/controls/declaration";
import { ____VarRef } from "lawtext/dist/src/node/el/controls/varRef";


export const WrapHTMLControlRun: React.FC<WrapperComponentProps> = props => {
    const { childProps, ChildComponent } = props;
    const { el, htmlOptions } = childProps as HTMLComponentProps & HTMLControlRunProps;

    if (el.tag === "____Declaration") {
        return <Declaration el={el as ____Declaration} {...{ htmlOptions }} />;

    } else if (el.tag === "____VarRef") {
        return <VarRef el={el as ____VarRef} {...{ htmlOptions }} />;

    } else if (el.tag === "____LawNum") {
        return <____LawNum el={el} {...{ htmlOptions }} />;

    } else {
        return <ChildComponent {...childProps} />;
    }
};

export const ControlGlobalStyle = createGlobalStyle`
.control-parentheses-content[data-lawtext_parentheses_type="square"] {
    color: rgb(158, 79, 0);
}

.lawtext-varref-open .lawtext-varref-text {
    background-color: rgba(127, 127, 127, 0.15);
    border-bottom: 1px solid rgb(40, 167, 69);
}

.lawtext-varref-text:hover {
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


const VarRefSpan = styled.span`
`;

const VarRefTextSpan = styled.span`
    border-bottom: 1px solid rgba(127, 127, 127, 0.3);
    cursor: pointer;
    transition: background-color 0.3s, border-bottom-color 0.3s;
`;

// eslint-disable-next-line no-unused-vars
enum VarRefFloatState {
    // eslint-disable-next-line no-unused-vars
    HIDDEN,
    // eslint-disable-next-line no-unused-vars
    CLOSED,
    // eslint-disable-next-line no-unused-vars
    OPEN,
}

const VarRefFloatBlockInnerSpan = styled.div`
    position: relative;
    width: 100%;
    font-size: 1rem;
    padding: 0.5em;
`;

const VarRefArrowSpan = styled.div`
    position: absolute;
    border-style: solid;
    border-width: 0 0.5em 0.5em 0.5em;
    border-color: transparent transparent rgba(125, 125, 125) transparent;
    margin: -0.5em 0 0 0;
`;

const VarRefWindowSpan = styled.span`
    float: right;
    width: 100%;
    padding: 0.5em;
    border-radius: 0.2em;
    border: 1px solid rgba(125, 125, 125);
    background-color: rgba(240, 240, 240);
`;

interface ____VarRefProps { el: ____VarRef }

interface ____VarRefState { mode: VarRefFloatState, arrowLeft: string }

const VarRef = (props: HTMLComponentProps & ____VarRefProps) => {
    const { el, htmlOptions } = props;
    const options = htmlOptions.options as LawViewOptions;


    const refText = React.useRef<HTMLSpanElement>(null);
    const refWindow = React.useRef<HTMLSpanElement>(null);

    const [state, setState] = React.useState<____VarRefState>({ mode: VarRefFloatState.HIDDEN, arrowLeft: "" });

    React.useEffect(() => {
        return () => {
            window.removeEventListener("resize", updateSize);
        };
    }, []);

    const analysis = options.lawData.analysis;
    if (!analysis) return (<>{el.text()}</>);

    const varRefTextSpanOnClick = (/* e: React.MouseEvent<HTMLSpanElement> */) => {
        if (state.mode === VarRefFloatState.OPEN) {
            setState(prevState => ({ ...prevState, mode: VarRefFloatState.CLOSED }));
            window.removeEventListener("resize", updateSize);
        } else {
            setState(prevState => ({ ...prevState, mode: VarRefFloatState.OPEN }));
            setTimeout(() => {
                updateSize();
                window.addEventListener("resize", updateSize);
            }, 0);
        }
    };

    const onAnimationEnd = () => {
        if (state.mode === VarRefFloatState.CLOSED) {
            setState(prevState => ({ ...prevState, mode: VarRefFloatState.HIDDEN }));
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

    const animateHeightOnAnimationEnd = () => {
        onAnimationEnd();
    };

    const declaration = analysis.declarations.get(el.attr.declarationID);
    const declContainer = analysis.sentenceEnvs[declaration.nameSentenceTextRange.start.sentenceIndex].container;
    const containerID = declContainer.containerID;

    return (
        <VarRefSpan>

            <VarRefTextSpan onClick={varRefTextSpanOnClick} ref={refText}>
                <HTMLSentenceChildrenRun els={el.children as (string | SentenceChildEL)[]} {...{ htmlOptions }} />
            </VarRefTextSpan>

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

                <AnimateHeight
                    height={state.mode === VarRefFloatState.OPEN ? "auto" : 0}
                    style={{
                        width: "100%",
                        padding: 0,
                        margin: 0,
                        textIndent: 0,
                        fontSize: 0,
                        fontWeight: "normal",
                        // overflow: "hidden",
                        position: "absolute",
                        color: "initial",
                    }}
                    onAnimationEnd={animateHeightOnAnimationEnd}
                    duration={100}
                >
                    {(state.mode !== VarRefFloatState.HIDDEN) && (
                        <VarRefFloatBlockInnerSpan>
                            <VarRefArrowSpan style={state.arrowLeft ? { marginLeft: state.arrowLeft } : { visibility: "hidden" }} />
                            <VarRefWindowSpan ref={refWindow}>
                                <PeekContainerView containerID={containerID} {...{ htmlOptions }} />
                            </VarRefWindowSpan>
                        </VarRefFloatBlockInnerSpan>
                    )}
                </AnimateHeight>
            </div>

        </VarRefSpan>
    );
};


interface PeekContainerViewProps { containerID: string }

const PeekContainerView = (props: HTMLComponentProps & PeekContainerViewProps) => {
    const { containerID, htmlOptions } = props;
    const options = htmlOptions.options as LawViewOptions;

    const analysis = options.lawData.analysis;
    if (!analysis) return null;

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
        "ArticleTitle",
        ...std.paragraphItemTitleTags,
        "TableStructTitle",
    ];
    const ignoreTags = ["ArticleCaption", "ParagraphCaption", ...titleTags];

    for (const container of containerStack) {
        if (std.isEnactStatement(container.el)) {
            names.push("（制定文）");

        } else if (std.isArticle(container.el)) {
            const articleTitle = container.el.children
                .find(std.isArticleTitle);
            if (articleTitle) names.push(articleTitle.text());

        } else if (std.isParagraph(container.el)) {
            const paragraphNum = container.el.children
                .find(std.isParagraphNum);
            if (paragraphNum) names.push(paragraphNum.text() || "１");

        } else if (std.isParagraphItem(container.el)) {
            const itemTitle = (container.el.children as EL[])
                .find(std.isParagraphItemTitle);
            if (itemTitle) names.push(itemTitle.text());

        } else if (std.isTableStruct(container.el)) {
            const tableStructTitleEl = container.el.children
                .find(std.isTableStructTitle);
            const tableStructTitle = tableStructTitleEl
                ? tableStructTitleEl.text()
                : "表";
            names.push(tableStructTitle + "（抜粋）");

        } else {
            continue;
        }
    }

    const declElTitleTag = titleTags
        .find(s => Boolean(s) && s.startsWith(container.el.tag));

    if (declElTitleTag) {
        const declEl = new EL(
            container.el.tag,
            {},
            [
                new EL(declElTitleTag, {}, [names.join("／")]),
                ...(container.el.children as EL[])
                    .filter(child => ignoreTags.indexOf(child.tag) < 0),
            ],
        );

        if (std.isArticle(declEl)) {
            return <HTMLArticle el={declEl} indent={0} {...{ htmlOptions }} />;

        } else if (std.isParagraphItem(declEl)) {
            return <HTMLParagraphItem el={declEl} indent={0} {...{ htmlOptions }} />;

        } else if (std.isTable(declEl)) {
            return <HTMLTable el={declEl} indent={0} {...{ htmlOptions }} />;

        } else {
            throw new NotImplementedError(declEl.tag);

        }
    } else if (std.isEnactStatement(container.el)) {
        return (
            <div style={{ paddingLeft: "1em", textIndent: "-1em" }}>
                <span>{names.join("／")}</span>
                <HTMLMarginSpan/>
                <HTMLSentenceChildrenRun els={container.el.children} {...{ htmlOptions }} />
            </div>
        );

    } else {
        throw new NotImplementedError(container.el.tag);

    }
};


const LawNumA = styled.a`
`;

interface ____LawNumProps { el: std.__EL }

const ____LawNum = (props: HTMLComponentProps & ____LawNumProps) => {
    const { el, htmlOptions } = props;
    return (
        <LawNumA href={`#/${el.text()}`} target="_blank">
            <HTMLSentenceChildrenRun els={el.children as (string | SentenceChildEL)[]} {...{ htmlOptions }} />
        </LawNumA>
    );
};

