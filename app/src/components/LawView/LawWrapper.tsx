import React, { } from "react";
import styled from "styled-components";
import { ErrorCatcher } from "./ErrorCatcher";
import type { WrapperComponentProps } from "lawtext/dist/src/renderer/common/html";
import type { LawViewOptions } from "./common";
import { EL } from "lawtext/dist/src/node/el";
import * as std from "lawtext/dist/src/law/std";
import { containerInfoOf } from "../../actions/download";
import ReplaceHTMLFigRun from "./ReplaceHTMLFigRun";
import WrapHTMLControlRun from "./controls/WrapHTMLControlRun";
import WrapHTMLParagraphItem from "./controls/WrapHTMLParagraphItem";
import { containerTags } from "lawtext/dist/src/node/container";
import WrapHTMLToplevelAndArticles from "./controls/WrapHTMLToplevelAndArticles";


const wrapperByID: Record<string, React.FC<WrapperComponentProps>> = {};

wrapperByID["HTMLControlRun"] = WrapHTMLControlRun;
wrapperByID["HTMLFigRun"] = ReplaceHTMLFigRun;
wrapperByID["HTMLParagraphItem"] = WrapHTMLParagraphItem;

wrapperByID["HTMLArticleGroup"] = WrapHTMLToplevelAndArticles;
wrapperByID["HTMLAppdxItem"] = WrapHTMLToplevelAndArticles;
wrapperByID["HTMLSupplProvision"] = WrapHTMLToplevelAndArticles;
wrapperByID["HTMLEnactStatement"] = WrapHTMLToplevelAndArticles;
wrapperByID["HTMLPreamble"] = WrapHTMLToplevelAndArticles;

const ErrorComponentDiv = styled.div`
`;

class LawErrorCatcher extends ErrorCatcher {
    protected override renderError(): React.JSX.Element | React.JSX.Element[] | null | undefined {
        return (
            <ErrorComponentDiv className="alert alert-danger">
                レンダリング時にエラーが発生しました：
                {this.state.error && this.state.error.toString()}
            </ErrorComponentDiv>
        );
    }
}

export const WrapLawComponent: React.FC<WrapperComponentProps> = props => {
    const { htmlComponentID, childProps, ChildComponent } = props;
    const options = childProps.htmlOptions.options as LawViewOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const el = (childProps as any).el;

    const elID = (
        (el instanceof EL)
        && (containerTags.includes(el.tag as typeof containerTags[number]) || std.isPreamble(el) || std.isTOC(el))
        && (!["TableRow", "TableColumn"].includes(el.tag as typeof containerTags[number]))
        && el.id
    );

    const WrapperByID = wrapperByID[htmlComponentID];

    const baseElement = (
        // (htmlComponentID === "HTMLSentenceChildrenRun")
        //     ? <WrapHTMLSentenceChildrenRun {...props}/>
        //     :
        (WrapperByID)
            ? <WrapperByID {...props}/>
            : <ChildComponent {...childProps} />
    );

    const dataset = [] as [string, unknown][];

    if (
        (el instanceof EL)
        && (std.isTOC(el) || std.isAppdxItem(el) || std.isSupplProvision(el) || std.isMainProvision(el))
    ){
        dataset.push(["data-toplevel_container_info", JSON.stringify(containerInfoOf(el))]);
    }

    if (
        (el instanceof EL)
        && (containerTags.includes(el.tag as typeof containerTags[number]))
        && (!["TableRow", "TableColumn"].includes(el.tag as typeof containerTags[number]))
    ){
        dataset.push(["data-container_info", JSON.stringify(containerInfoOf(el))]);
    }

    const withDatasetElement = (
        dataset.length > 0
            ? <div {...Object.fromEntries(dataset)}>{baseElement}</div>
            : baseElement
    );

    const catchError = (el instanceof EL)
    && (std.isLaw(el) || std.isPreamble(el) || std.isTOC(el) || std.isAppdxItem(el) || std.isSupplProvisionAppdxItem(el) || std.isSupplProvision(el) || std.isArticleGroup(el) || std.isArticle(el) || std.isParagraphItem(el));

    const withCatcherElement = (
        catchError
            ? <LawErrorCatcher onError={options.onError}>{withDatasetElement}</LawErrorCatcher>
            : withDatasetElement
    );


    return (<>
        {(typeof elID === "number") &&
            <a className="law-anchor" data-el_id={elID.toString()} />
        }
        {withCatcherElement}
    </>);
};

