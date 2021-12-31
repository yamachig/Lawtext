import $ from "jquery";
import React, { useCallback, useMemo } from "react";
import AnimateHeight from "react-animate-height";
import styled, { createGlobalStyle } from "styled-components";
import { assertNever, NotImplementedError, omit } from "lawtext/dist/src/util";
import { EL } from "lawtext/dist/src/node/el";
import * as std from "lawtext/dist/src/law/std";
import { LawtextAppPageStateStruct, OrigSetLawtextAppPageState } from "./LawtextAppPageState";
import path from "path";
import { storedLoader } from "@appsrc/lawdata/loaders";
import { LawData } from "@appsrc/lawdata/common";
import { containerInfoOf } from "@appsrc/actions/download";
import { useObserved } from "./useObserved";
import { ErrorCatcher } from "./ErrorCatcher";


const MARGIN = "　";

const em = (input: number) => {
    const emSize = parseFloat($("body").css("font-size"));
    return (emSize * input);
};

const NoMarginDiv = styled.div`
    margin-left: 0;
    padding-left: 0;
    text-indent: 0;
`;


const LawViewDiv = styled.div`
    padding: 2rem 3rem 10rem 3rem;
`;

export const LawView: React.FC<LawtextAppPageStateStruct> = props => {
    const { origState, origSetState } = props;

    const onError = useCallback((error: Error) => {
        origSetState(prev => ({ ...prev, hasError: true, errors: [...prev.errors, error] }));
    }, [origSetState]);

    const MemoLawDataComponent = React.useMemo(() => React.memo(LawDataComponent), []);

    return (
        <LawViewDiv>
            <GlobalStyle />
            {origState.hasError && <LawViewError {...props} />}
            {origState.law &&
                (origState.navigatedLawSearchKey === props.lawSearchKey) &&
                    <MemoLawDataComponent lawData={origState.law} onError={onError} origSetState={origSetState} />
            }
        </LawViewDiv>
    );
};

const useAfterMountTasks = (origSetState: OrigSetLawtextAppPageState) => {
    const status = React.useMemo(() => ({
        tasks: [] as (() => unknown)[],
        doneCount: 0,
        started: null as Date | null,
    }), []);

    const addAfterMountTask = React.useCallback((func: () => unknown) => {
        status.tasks.push(func);
    }, [status]);

    const checkTaskTimer = React.useRef<NodeJS.Timer>();

    const checkTaskInner = React.useCallback(() => {

        const tasks = status.tasks.splice(0, 512);

        if (tasks.length === 0) {
            checkTaskTimer.current = setTimeout(checkTaskInner, 3000);
            return;
        }

        if (!status.started) {
            console.log("useAfterMountTasks started");
            status.started = new Date();
            status.doneCount = 0;

            origSetState(s => ({
                ...s,
                viewerMessages: {
                    ...s.viewerMessages,
                    afterMountTasks: "追加のレンダリングを行っています (0%)...",
                },
            }));
        }

        for (const task of tasks) {
            task();
            status.doneCount++;
        }

        if (status.tasks.length > 0) {
            origSetState(s => ({
                ...s,
                viewerMessages: {
                    ...s.viewerMessages,
                    afterMountTasks: `追加のレンダリングを行っています (${Math.ceil(status.doneCount / (status.doneCount + status.tasks.length) * 100)}%)...`,
                },
            }));
        } else {
            origSetState(s => ({
                ...s,
                viewerMessages: omit(s.viewerMessages, "afterMountTasks"),
            }));
        }

        if (status.tasks.length === 0 && status.started) {
            console.log(`useAfterMountTasks finished: ${status.doneCount} items in ${new Date().getTime() - status.started.getTime()} ms`);
            status.started = null;
        }

        checkTaskTimer.current = setTimeout(checkTaskInner, 1);

    }, [origSetState, status]);

    React.useEffect(() => {
        checkTaskTimer.current = setTimeout(checkTaskInner, 300);
        return () => {
            if (checkTaskTimer.current) clearTimeout(checkTaskTimer.current);
        };
    }, [checkTaskInner]);

    return {
        addAfterMountTask,
    };
};

const LawDataComponent: React.FC<{
    lawData: LawData,
    onError: (error: Error) => unknown,
    origSetState: OrigSetLawtextAppPageState,
}> = props => {
    const { lawData, onError, origSetState } = props;

    const { addAfterMountTask } = useAfterMountTasks(origSetState);

    const ls = useMemo(() => ({
        onError,
        lawData,
        addAfterMountTask,
    }), [onError, lawData, addAfterMountTask]);

    return <LawComponent
        el={lawData.el}
        indent={0}
        ls={ls}
    />;
};

interface BaseLawCommonState {
    onError: (error: Error) => void;
    lawData: LawData,
    addAfterMountTask: (func: () => unknown) => void,
}

interface BaseLawCommonProps {
    ls: BaseLawCommonState;
}

const LawViewErrorDiv = styled.div`
`;

const LawViewError: React.FC<LawtextAppPageStateStruct> = props => {
    const { origState } = props;
    return (
        <LawViewErrorDiv className="alert alert-danger">
            レンダリング時に{origState.errors.length}個のエラーが発生しました
        </LawViewErrorDiv>
    );
};


const ErrorComponentDiv = styled.div`
`;

function withCatcher<P>(Component: React.ComponentType<P & BaseLawCommonProps>) {
    return function WithCatcher(props: P & BaseLawCommonProps) {
        return (
            <LawErrorCatcher onError={props.ls.onError}>
                <Component {...props} />
            </LawErrorCatcher>
        );
    };
}

class LawErrorCatcher extends ErrorCatcher {
    protected override renderError(): JSX.Element | JSX.Element[] | null | undefined {
        return (
            <ErrorComponentDiv className="alert alert-danger">
                レンダリング時にエラーが発生しました：
                {this.state.error && this.state.error.toString()}
            </ErrorComponentDiv>
        );
    }
}


interface ELComponentProps { el: EL }

type AnyLawComponentProps = (
    LawComponentProps |
    LawBodyComponentProps |
    LawTitleComponentProps |
    EnactStatementComponentProps |
    TOCComponentProps |
    TOCItemComponentProps |
    AppdxTableComponentProps |
    AppdxStyleComponentProps |
    AppdxFigComponentProps |
    SupplProvisionComponentProps |
    ArticleGroupComponentProps |
    ArticleGroupTitleComponentProps |
    ArticleComponentProps |
    ParagraphItemComponentProps |
    ListComponentProps |
    TableStructComponentProps |
    TableComponentProps |
    RemarksComponentProps |
    TableRowComponentProps |
    TableColumnComponentProps |
    NoteStyleFormatComponentProps |
    StyleStructComponentProps |
    FigStructComponentProps |
    FigRunComponentProps |
    QuoteStructRunComponentProps |
    ArithFormulaRunComponentProps |
    AmendProvisionComponentProps |
    PreambleComponentProps |
    AppdxNoteComponentProps |
    AppdxComponentProps |
    AppdxFormatComponentProps |
    SupplProvisionAppdxTableComponentProps |
    SupplProvisionAppdxStyleComponentProps |
    SupplProvisionAppdxComponentProps |
    NoteStructComponentProps |
    FormatStructComponentProps |
    SentenceDummyProps
);

const AnyLawComponent = withCatcher<AnyLawComponentProps>(props => {
    if (isLawComponentProps(props)) { return <LawComponent {...props} />; }
    else if (isLawBodyComponentProps(props)) { return <LawBodyComponent {...props} />; }
    else if (isLawTitleComponentProps(props)) { return <LawTitleComponent {...props} />; }
    else if (isEnactStatementComponentProps(props)) { return <EnactStatementComponent {...props} />; }
    else if (isTOCComponentProps(props)) { return <TOCComponent {...props} />; }
    else if (isTOCItemComponentProps(props)) { return <TOCItemComponent {...props} />; }
    else if (isAppdxTableComponentProps(props)) { return <AppdxTableComponent {...props} />; }
    else if (isAppdxStyleComponentProps(props)) { return <AppdxStyleComponent {...props} />; }
    else if (isAppdxFigComponentProps(props)) { return <AppdxFigComponent {...props} />; }
    else if (isSupplProvisionComponentProps(props)) { return <SupplProvisionComponent {...props} />; }
    else if (isArticleGroupComponentProps(props)) { return <ArticleGroupComponent {...props} />; }
    else if (isArticleGroupTitleComponentProps(props)) { return <ArticleGroupTitleComponent {...props} />; }
    else if (isArticleComponentProps(props)) { return <ArticleComponent {...props} />; }
    else if (isParagraphItemComponentProps(props)) { return <ParagraphItemComponent {...props} />; }
    else if (isListComponentProps(props)) { return <ListComponent {...props} />; }
    else if (isTableStructComponentProps(props)) { return <TableStructComponent {...props} />; }
    else if (isTableComponentProps(props)) { return <TableComponent {...props} />; }
    else if (isRemarksComponentProps(props)) { return <RemarksComponent {...props} />; }
    else if (isTableRowComponentProps(props)) { return <TableRowComponent {...props} />; }
    else if (isTableColumnComponentProps(props)) { return <TableColumnComponent {...props} />; }
    else if (isNoteStyleFormatComponentProps(props)) { return <NoteStyleFormatComponent {...props} />; }
    else if (isStyleStructComponentProps(props)) { return <StyleStructComponent {...props} />; }
    else if (isFigStructComponentProps(props)) { return <FigStructComponent {...props} />; }
    else if (isFigRunComponentProps(props)) { return <FigRunComponent {...props} />; }
    else if (isQuoteStructRunComponentProps(props)) { return <QuoteStructRunComponent {...props} />; }
    else if (isArithFormulaRunComponentProps(props)) { return <ArithFormulaRunComponent {...props} />; }
    else if (isAmendProvisionComponentProps(props)) { return <AmendProvisionComponent {...props} />; }
    else if (isPreambleComponentProps(props)) { return <PreambleComponent {...props} />; }
    else if (isAppdxNoteComponentProps(props)) { return <AppdxNoteComponent {...props} />; }
    else if (isAppdxComponentProps(props)) { return <AppdxComponent {...props} />; }
    else if (isAppdxFormatComponentProps(props)) { return <AppdxFormatComponent {...props} />; }
    else if (isSupplProvisionAppdxTableComponentProps(props)) { return <SupplProvisionAppdxTableComponent {...props} />; }
    else if (isSupplProvisionAppdxStyleComponentProps(props)) { return <SupplProvisionAppdxStyleComponent {...props} />; }
    else if (isSupplProvisionAppdxComponentProps(props)) { return <SupplProvisionAppdxComponent {...props} />; }
    else if (isNoteStructComponentProps(props)) { return <NoteStructComponent {...props} />; }
    else if (isFormatStructComponentProps(props)) { return <FormatStructComponent {...props} />; }
    else if (isSentenceDummyProps(props)) { return <BlockSentenceComponent els={[props.el]} indent={props.indent} ls={props.ls} />; }
    else { return assertNever(props); }
});


interface LawComponentProps extends ELComponentProps { el: std.Law, indent: number }

const isLawComponentProps = (props: ELComponentProps): props is LawComponentProps => props.el.tag === "Law";

const LawComponent = withCatcher<LawComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;
    let LawNum = "";
    let LawBody: std.LawBody | null = null;
    for (const child of el.children) {
        if (child.tag === "LawNum") {
            LawNum = child.text;
        } else if (child.tag === "LawBody") {
            LawBody = child;
        } else {
            assertNever(child);
        }
    }

    return LawBody && <LawBodyComponent el={LawBody} indent={indent} LawNum={LawNum} ls={props.ls} />;
});


interface LawBodyComponentProps extends ELComponentProps { el: std.LawBody, indent: number, LawNum: string }

const isLawBodyComponentProps = (props: ELComponentProps): props is LawBodyComponentProps => props.el.tag === "LawBody";

const LawBodyComponent = withCatcher<LawBodyComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;
    const LawNum = props.LawNum;

    const blocks: JSX.Element[] = [];
    for (const child of el.children) {

        if (child.tag === "LawTitle") {
            blocks.push(<LawTitleComponent el={child} indent={indent} LawNum={LawNum} key={child.id} ls={props.ls} />);

        } else if (child.tag === "TOC") {
            blocks.push(<TOCComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "MainProvision") {
            blocks.push(<ArticleGroupComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "SupplProvision") {
            blocks.push(<SupplProvisionComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "AppdxTable") {
            blocks.push(<AppdxTableComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "AppdxStyle") {
            blocks.push(<AppdxStyleComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "AppdxFig") {
            blocks.push(<AppdxFigComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "AppdxNote") {
            blocks.push(<AppdxNoteComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "AppdxFormat") {
            blocks.push(<AppdxFormatComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "Appdx") {
            blocks.push(<AppdxComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "EnactStatement") {
            blocks.push(<EnactStatementComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "Preamble") {
            blocks.push(<PreambleComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        }
        else { assertNever(child); }
    }
    return <>{blocks}</>;
});


const LawTitleDiv = styled.div`
    font-weight: bold;
`;

const LawNumDiv = styled.div`
    font-weight: bold;
`;

interface LawTitleComponentProps extends ELComponentProps { el: std.LawTitle, indent: number, LawNum: string }

const isLawTitleComponentProps = (props: ELComponentProps): props is LawTitleComponentProps => props.el.tag === "LawTitle";

const LawTitleComponent = withCatcher<LawTitleComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;
    const LawNum = props.LawNum;

    return (
        <div
            className="law-anchor"
            data-el_id={el.id.toString()}
        >
            <LawTitleDiv style={{ marginLeft: `${indent}em` }}>
                {el.text}
            </LawTitleDiv>
            {LawNum &&
                <LawNumDiv>
                    （{LawNum}）
                </LawNumDiv>
            }
        </div>
    );
});


const PreambleDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

interface PreambleComponentProps extends ELComponentProps { el: std.Preamble, indent: number }

const isPreambleComponentProps = (props: ELComponentProps): props is PreambleComponentProps => props.el.tag === "Preamble";

const PreambleComponent = withCatcher<PreambleComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;
    const blocks: JSX.Element[] = [];

    for (const paragraph of el.children) {
        blocks.push(<ParagraphItemComponent el={paragraph} indent={indent} key={paragraph.id} ls={props.ls} />);
    }

    return (
        <PreambleDiv
            className="law-anchor"
            data-el_id={el.id.toString()}
        >
            {blocks}
        </PreambleDiv>
    );
});


const EnactStatementDiv = styled.div`
    clear: both;
    padding-top: 1em;
    text-indent: 1em;
`;

interface EnactStatementComponentProps extends ELComponentProps { el: std.EnactStatement, indent: number }

const isEnactStatementComponentProps = (props: ELComponentProps): props is EnactStatementComponentProps => props.el.tag === "EnactStatement";

const EnactStatementComponent = withCatcher<EnactStatementComponentProps>(props => {
    const el = props.el;
    // const indent = props.indent;

    return (
        <EnactStatementDiv>
            {el.text}
        </EnactStatementDiv>
    );
});


const TOCDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

interface TOCComponentProps extends ELComponentProps { el: std.TOC, indent: number }

const isTOCComponentProps = (props: ELComponentProps): props is TOCComponentProps => props.el.tag === "TOC";

const TOCComponent = withCatcher<TOCComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];
    // let tocLabelText = "";
    for (const child of el.children) {

        if (child.tag === "TOCLabel") {

            // tocLabelText = child.text;
            blocks.push(
                <div
                    className="law-anchor"
                    data-el_id={el.id.toString()}
                    style={{ marginLeft: `${indent}em` }}
                    key={child.id}
                >
                    {child.text}
                </div>,
            );

        } else if (child.tag === "TOCPart" || child.tag === "TOCChapter" || child.tag === "TOCSection" || child.tag === "TOCSupplProvision" || child.tag === "TOCArticle" || child.tag === "TOCAppdxTableLabel" || child.tag === "TOCPreambleLabel") {
            blocks.push(<TOCItemComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return (
        <TOCDiv
            data-toplevel_container_info={JSON.stringify(containerInfoOf(el))}
        >
            {blocks}
        </TOCDiv>
    );
});


interface TOCItemComponentProps extends ELComponentProps { el: std.TOCPart | std.TOCChapter | std.TOCSection | std.TOCSubsection | std.TOCDivision | std.TOCSupplProvision | std.TOCArticle | std.TOCAppdxTableLabel | std.TOCPreambleLabel, indent: number }

const isTOCItemComponentProps = (props: ELComponentProps): props is TOCItemComponentProps => {
    return props.el.tag === "TOCPart" || props.el.tag === "TOCPart" || props.el.tag === "TOCChapter" || props.el.tag === "TOCSection" || props.el.tag === "TOCSubsection" || props.el.tag === "TOCDivision" || props.el.tag === "TOCSupplProvision" || props.el.tag === "TOCArticle" || props.el.tag === "TOCAppdxTableLabel" || props.el.tag === "TOCPreambleLabel";
};

const TOCItemComponent = withCatcher<TOCItemComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];
    if (el.tag === "TOCArticle") {
        let ArticleTitle: std.ArticleTitle | null = null;
        let ArticleCaption: std.ArticleCaption | null = null;
        for (const child of el.children) {
            if (child.tag === "ArticleTitle") {
                ArticleTitle = child;
            } else if (child.tag === "ArticleCaption") {
                ArticleCaption = child;
            }
            else { assertNever(child); }
        }
        if (ArticleTitle || ArticleCaption) {
            blocks.push(
                <div
                    style={{ marginLeft: `${indent}em` }}
                    key={(ArticleTitle || ArticleCaption || { id: 0 }).id}
                >
                    {ArticleTitle && <RunComponent els={ArticleTitle.children} ls={props.ls} />}
                    {ArticleCaption && <RunComponent els={ArticleCaption.children} ls={props.ls} />}
                </div>,
            );
        }

    } else if (el.tag === "TOCPreambleLabel" || el.tag === "TOCAppdxTableLabel") {
        blocks.push(
            <div
                style={{ marginLeft: `${indent}em` }}
                key={el.id}
            >
                <RunComponent els={el.children} ls={props.ls} />
            </div>,
        );

    } else {
        let TocItemTitle: std.PartTitle | std.ChapterTitle | std.SectionTitle | std.SubsectionTitle | std.DivisionTitle | std.SupplProvisionLabel | null = null;
        let ArticleRange: std.ArticleRange | null = null;
        const TOCItems: Array<std.TOCChapter | std.TOCSection | std.TOCSubsection | std.TOCDivision | std.TOCArticle> = [];
        for (const child of el.children) {

            if (child.tag === "PartTitle" || child.tag === "ChapterTitle" || child.tag === "SectionTitle" || child.tag === "SubsectionTitle" || child.tag === "DivisionTitle" || child.tag === "SupplProvisionLabel") {
                TocItemTitle = child;

            } else if (child.tag === "ArticleRange") {
                ArticleRange = child;

            } else if (child.tag === "TOCChapter" || child.tag === "TOCSection" || child.tag === "TOCSubsection" || child.tag === "TOCDivision" || child.tag === "TOCArticle") {
                TOCItems.push(child);

            }
            else { assertNever(child); }
        }
        if (TocItemTitle || ArticleRange) {
            blocks.push(
                <div
                    style={{ marginLeft: `${indent}em` }}
                    key={(TocItemTitle || ArticleRange || { id: 0 }).id}
                >
                    {TocItemTitle && <RunComponent els={TocItemTitle.children} ls={props.ls} />}
                    {ArticleRange && <RunComponent els={ArticleRange.children} ls={props.ls} />}
                </div>,
            );
        }
        for (const TOCItem of TOCItems) {
            blocks.push(<TOCItemComponent el={TOCItem} indent={indent + 1} key={TOCItem.id} ls={props.ls} />); /* >>>> INDENT >>>> */
        }

    }
    return <>{blocks}</>;
});


const AppdxTableDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

const AppdxTableTitleDiv = styled.div`
    font-weight: bold;
`;

interface AppdxTableComponentProps extends ELComponentProps { el: std.AppdxTable, indent: number }

const isAppdxTableComponentProps = (props: ELComponentProps): props is AppdxTableComponentProps => props.el.tag === "AppdxTable";

const AppdxTableComponent = withCatcher<AppdxTableComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    let AppdxTableTitle: std.AppdxTableTitle | null = null;
    let RelatedArticleNum: std.RelatedArticleNum | null = null;
    const ChildItems: Array<std.TableStruct | std.Item | std.Remarks> = [];
    for (const child of el.children) {

        if (child.tag === "AppdxTableTitle") {
            AppdxTableTitle = child;

        } else if (child.tag === "RelatedArticleNum") {
            RelatedArticleNum = child;

        } else if (child.tag === "TableStruct" || child.tag === "Item" || child.tag === "Remarks") {
            ChildItems.push(child);

        }
        else { assertNever(child); }
    }

    if (AppdxTableTitle || RelatedArticleNum) {
        blocks.push(
            <AppdxTableTitleDiv
                className="law-anchor"
                data-el_id={el.id.toString()}
                key={(AppdxTableTitle || RelatedArticleNum || { id: 0 }).id}
            >
                {AppdxTableTitle && <RunComponent els={AppdxTableTitle.children} ls={props.ls} />}
                {RelatedArticleNum && <RunComponent els={RelatedArticleNum.children} ls={props.ls} />}
            </AppdxTableTitleDiv>,
        );
    }

    for (const child of ChildItems) {
        if (child.tag === "TableStruct") {
            blocks.push(<TableStructComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "Item") {
            blocks.push(<ParagraphItemComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "Remarks") {
            blocks.push(<RemarksComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return (
        <AppdxTableDiv
            data-toplevel_container_info={JSON.stringify(containerInfoOf(el))}
        >
            {blocks}
        </AppdxTableDiv>
    );
});


const AppdxStyleDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

const AppdxStyleTitleDiv = styled.div`
    font-weight: bold;
`;

interface AppdxStyleComponentProps extends ELComponentProps { el: std.AppdxStyle, indent: number }

const isAppdxStyleComponentProps = (props: ELComponentProps): props is AppdxStyleComponentProps => props.el.tag === "AppdxStyle";

const AppdxStyleComponent = withCatcher<AppdxStyleComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    let AppdxStyleTitle: std.AppdxStyleTitle | null = null;
    let RelatedArticleNum: std.RelatedArticleNum | null = null;
    const ChildItems: Array<std.StyleStruct | std.Item | std.Remarks> = [];
    for (const child of el.children) {

        if (child.tag === "AppdxStyleTitle") {
            AppdxStyleTitle = child;

        } else if (child.tag === "RelatedArticleNum") {
            RelatedArticleNum = child;

        } else if (child.tag === "StyleStruct" || child.tag === "Remarks") {
            ChildItems.push(child);

        }
        else { assertNever(child); }
    }

    if (AppdxStyleTitle || RelatedArticleNum) {
        blocks.push(
            <AppdxStyleTitleDiv
                className="law-anchor"
                data-el_id={el.id.toString()}
                key={(AppdxStyleTitle || RelatedArticleNum || { id: 0 }).id}
            >
                {AppdxStyleTitle && <RunComponent els={AppdxStyleTitle.children} ls={props.ls} />}
                {RelatedArticleNum && <RunComponent els={RelatedArticleNum.children} ls={props.ls} />}
            </AppdxStyleTitleDiv>,
        );
    }

    for (const child of ChildItems) {
        if (child.tag === "StyleStruct") {
            blocks.push(<StyleStructComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "Item") {
            blocks.push(<ParagraphItemComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "Remarks") {
            blocks.push(<RemarksComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return (
        <AppdxStyleDiv
            data-toplevel_container_info={JSON.stringify(containerInfoOf(el))}
        >
            {blocks}
        </AppdxStyleDiv>
    );
});


const AppdxFormatDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

const AppdxFormatTitleDiv = styled.div`
    font-weight: bold;
`;

interface AppdxFormatComponentProps extends ELComponentProps { el: std.AppdxFormat, indent: number }

const isAppdxFormatComponentProps = (props: ELComponentProps): props is AppdxFormatComponentProps => props.el.tag === "AppdxFormat";

const AppdxFormatComponent = withCatcher<AppdxFormatComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    let AppdxFormatTitle: std.AppdxFormatTitle | null = null;
    let RelatedArticleNum: std.RelatedArticleNum | null = null;
    const ChildItems: Array<std.FormatStruct | std.Remarks> = [];
    for (const child of el.children) {

        if (child.tag === "AppdxFormatTitle") {
            AppdxFormatTitle = child;

        } else if (child.tag === "RelatedArticleNum") {
            RelatedArticleNum = child;

        } else if (child.tag === "FormatStruct" || child.tag === "Remarks") {
            ChildItems.push(child);

        }
        else { assertNever(child); }
    }

    if (AppdxFormatTitle || RelatedArticleNum) {
        blocks.push(
            <AppdxFormatTitleDiv
                className="law-anchor"
                data-el_id={el.id.toString()}
                key={(AppdxFormatTitle || RelatedArticleNum || { id: 0 }).id}
            >
                {AppdxFormatTitle && <RunComponent els={AppdxFormatTitle.children} ls={props.ls} />}
                {RelatedArticleNum && <RunComponent els={RelatedArticleNum.children} ls={props.ls} />}
            </AppdxFormatTitleDiv>,
        );
    }

    for (const child of ChildItems) {
        if (child.tag === "FormatStruct") {
            blocks.push(<FormatStructComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "Remarks") {
            blocks.push(<RemarksComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return (
        <AppdxFormatDiv
            data-toplevel_container_info={JSON.stringify(containerInfoOf(el))}
        >
            {blocks}
        </AppdxFormatDiv>
    );
});


const AppdxFigDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

const AppdxFigTitleDiv = styled.div`
    font-weight: bold;
`;

interface AppdxFigComponentProps extends ELComponentProps { el: std.AppdxFig, indent: number }

const isAppdxFigComponentProps = (props: ELComponentProps): props is AppdxFigComponentProps => props.el.tag === "AppdxFig";

const AppdxFigComponent = withCatcher<AppdxFigComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    let AppdxFigTitle: std.AppdxFigTitle | null = null;
    let RelatedArticleNum: std.RelatedArticleNum | null = null;
    const ChildItems: Array<std.TableStruct | std.FigStruct> = [];
    for (const child of el.children) {

        if (child.tag === "AppdxFigTitle") {
            AppdxFigTitle = child;

        } else if (child.tag === "RelatedArticleNum") {
            RelatedArticleNum = child;

        } else if (child.tag === "FigStruct" || child.tag === "TableStruct") {
            ChildItems.push(child);

        }
        else { assertNever(child); }
    }

    if (AppdxFigTitle || RelatedArticleNum) {
        blocks.push(
            <AppdxFigTitleDiv
                className="law-anchor"
                data-el_id={el.id.toString()}
                key={(AppdxFigTitle || RelatedArticleNum || { id: 0 }).id}
            >
                {AppdxFigTitle && <RunComponent els={AppdxFigTitle.children} ls={props.ls} />}
                {RelatedArticleNum && <RunComponent els={RelatedArticleNum.children} ls={props.ls} />}
            </AppdxFigTitleDiv>,
        );
    }

    for (const child of ChildItems) {
        if (child.tag === "TableStruct") {
            blocks.push(<TableStructComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "FigStruct") {
            blocks.push(<FigStructComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return (
        <AppdxFigDiv
            data-toplevel_container_info={JSON.stringify(containerInfoOf(el))}
        >
            {blocks}
        </AppdxFigDiv>
    );
});


const AppdxNoteDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

const AppdxNoteTitleDiv = styled.div`
    font-weight: bold;
`;

interface AppdxNoteComponentProps extends ELComponentProps { el: std.AppdxNote, indent: number }

const isAppdxNoteComponentProps = (props: ELComponentProps): props is AppdxNoteComponentProps => props.el.tag === "AppdxNote";

const AppdxNoteComponent = withCatcher<AppdxNoteComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    let AppdxNoteTitle: std.AppdxNoteTitle | null = null;
    let RelatedArticleNum: std.RelatedArticleNum | null = null;
    const ChildItems: Array<std.TableStruct | std.FigStruct | std.Remarks | std.NoteStruct> = [];
    for (const child of el.children) {

        if (child.tag === "AppdxNoteTitle") {
            AppdxNoteTitle = child;

        } else if (child.tag === "RelatedArticleNum") {
            RelatedArticleNum = child;

        } else if (child.tag === "NoteStruct" || child.tag === "FigStruct" || child.tag === "TableStruct" || child.tag === "Remarks") {
            ChildItems.push(child);

        }
        else { assertNever(child); }
    }

    if (AppdxNoteTitle || RelatedArticleNum) {
        blocks.push(
            <AppdxNoteTitleDiv
                className="law-anchor"
                data-el_id={el.id.toString()}
                key={(AppdxNoteTitle || RelatedArticleNum || { id: 0 }).id}
            >
                {AppdxNoteTitle && <RunComponent els={AppdxNoteTitle.children} ls={props.ls} />}
                {RelatedArticleNum && <RunComponent els={RelatedArticleNum.children} ls={props.ls} />}
            </AppdxNoteTitleDiv>,
        );
    }

    for (const child of ChildItems) {
        if (child.tag === "TableStruct") {
            blocks.push(<TableStructComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "FigStruct") {
            blocks.push(<FigStructComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "Remarks") {
            blocks.push(<RemarksComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "NoteStruct") {
            blocks.push(<NoteStructComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return (
        <AppdxNoteDiv
            data-toplevel_container_info={JSON.stringify(containerInfoOf(el))}
        >
            {blocks}
        </AppdxNoteDiv>
    );
});


const AppdxDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

const AppdxTitleDiv = styled.div`
    font-weight: bold;
`;

interface AppdxComponentProps extends ELComponentProps { el: std.Appdx, indent: number }

const isAppdxComponentProps = (props: ELComponentProps): props is AppdxComponentProps => props.el.tag === "Appdx";

const AppdxComponent = withCatcher<AppdxComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    let ArithFormulaNum: std.ArithFormulaNum | null = null;
    let RelatedArticleNum: std.RelatedArticleNum | null = null;
    const ChildItems: Array<std.ArithFormula | std.Remarks> = [];
    for (const child of el.children) {

        if (child.tag === "ArithFormulaNum") {
            ArithFormulaNum = child;

        } else if (child.tag === "RelatedArticleNum") {
            RelatedArticleNum = child;

        } else if (child.tag === "ArithFormula" || child.tag === "Remarks") {
            ChildItems.push(child);

        }
        else { assertNever(child); }
    }

    if (ArithFormulaNum || RelatedArticleNum) {
        blocks.push(
            <AppdxTitleDiv
                className="law-anchor"
                data-el_id={el.id.toString()}
                key={(ArithFormulaNum || RelatedArticleNum || { id: 0 }).id}
            >
                {ArithFormulaNum && <RunComponent els={ArithFormulaNum.children} ls={props.ls} />}
                {RelatedArticleNum && <RunComponent els={RelatedArticleNum.children} ls={props.ls} />}
            </AppdxTitleDiv>,
        );
    }

    for (const child of ChildItems) {
        if (child.tag === "ArithFormula") {
            blocks.push(
                <div style={{ marginLeft: `${indent + 1}em` }} key={child.id}>
                    <ArithFormulaRunComponent el={child} ls={props.ls} />
                </div>,
            ); /* >>>> INDENT >>>> */

        } else if (child.tag === "Remarks") {
            blocks.push(<RemarksComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return (
        <AppdxDiv
            data-toplevel_container_info={JSON.stringify(containerInfoOf(el))}
        >
            {blocks}
        </AppdxDiv>
    );
});


const SupplProvisionAppdxTableDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

const SupplProvisionAppdxTableTitleDiv = styled.div`
    font-weight: bold;
`;

interface SupplProvisionAppdxTableComponentProps extends ELComponentProps { el: std.SupplProvisionAppdxTable, indent: number }

const isSupplProvisionAppdxTableComponentProps = (props: ELComponentProps): props is SupplProvisionAppdxTableComponentProps => props.el.tag === "SupplProvisionAppdxTable";

const SupplProvisionAppdxTableComponent = withCatcher<SupplProvisionAppdxTableComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    let SupplProvisionAppdxTableTitle: std.SupplProvisionAppdxTableTitle | null = null;
    let RelatedArticleNum: std.RelatedArticleNum | null = null;
    const ChildItems: Array<std.TableStruct | std.Item | std.Remarks> = [];
    for (const child of el.children) {

        if (child.tag === "SupplProvisionAppdxTableTitle") {
            SupplProvisionAppdxTableTitle = child;

        } else if (child.tag === "RelatedArticleNum") {
            RelatedArticleNum = child;

        } else if (child.tag === "TableStruct") {
            ChildItems.push(child);

        }
        else { assertNever(child); }
    }

    if (SupplProvisionAppdxTableTitle || RelatedArticleNum) {
        blocks.push(
            <SupplProvisionAppdxTableTitleDiv
                className="law-anchor"
                data-el_id={el.id.toString()}
                key={(SupplProvisionAppdxTableTitle || RelatedArticleNum || { id: 0 }).id}
            >
                {SupplProvisionAppdxTableTitle && <RunComponent els={SupplProvisionAppdxTableTitle.children} ls={props.ls} />}
                {RelatedArticleNum && <RunComponent els={RelatedArticleNum.children} ls={props.ls} />}
            </SupplProvisionAppdxTableTitleDiv>,
        );
    }

    for (const child of ChildItems) {
        if (child.tag === "TableStruct") {
            blocks.push(<TableStructComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "Item") {
            blocks.push(<ParagraphItemComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "Remarks") {
            blocks.push(<RemarksComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return (
        <SupplProvisionAppdxTableDiv>
            {blocks}
        </SupplProvisionAppdxTableDiv>
    );
});


const SupplProvisionAppdxStyleDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

const SupplProvisionAppdxStyleTitleDiv = styled.div`
    font-weight: bold;
`;

interface SupplProvisionAppdxStyleComponentProps extends ELComponentProps { el: std.SupplProvisionAppdxStyle, indent: number }

const isSupplProvisionAppdxStyleComponentProps = (props: ELComponentProps): props is SupplProvisionAppdxStyleComponentProps => props.el.tag === "SupplProvisionAppdxStyle";

const SupplProvisionAppdxStyleComponent = withCatcher<SupplProvisionAppdxStyleComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    let SupplProvisionAppdxStyleTitle: std.SupplProvisionAppdxStyleTitle | null = null;
    let RelatedArticleNum: std.RelatedArticleNum | null = null;
    const ChildItems: Array<std.StyleStruct | std.Item | std.Remarks> = [];
    for (const child of el.children) {

        if (child.tag === "SupplProvisionAppdxStyleTitle") {
            SupplProvisionAppdxStyleTitle = child;

        } else if (child.tag === "RelatedArticleNum") {
            RelatedArticleNum = child;

        } else if (child.tag === "StyleStruct") {
            ChildItems.push(child);

        }
        else { assertNever(child); }
    }

    if (SupplProvisionAppdxStyleTitle || RelatedArticleNum) {
        blocks.push(
            <SupplProvisionAppdxStyleTitleDiv
                className="law-anchor"
                data-el_id={el.id.toString()}
                key={(SupplProvisionAppdxStyleTitle || RelatedArticleNum || { id: 0 }).id}
            >
                {SupplProvisionAppdxStyleTitle && <RunComponent els={SupplProvisionAppdxStyleTitle.children} ls={props.ls} />}
                {RelatedArticleNum && <RunComponent els={RelatedArticleNum.children} ls={props.ls} />}
            </SupplProvisionAppdxStyleTitleDiv>,
        );
    }

    for (const child of ChildItems) {
        if (child.tag === "StyleStruct") {
            blocks.push(<StyleStructComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "Item") {
            blocks.push(<ParagraphItemComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "Remarks") {
            blocks.push(<RemarksComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return (
        <SupplProvisionAppdxStyleDiv>
            {blocks}
        </SupplProvisionAppdxStyleDiv>
    );
});


const SupplProvisionAppdxDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

const SupplProvisionAppdxTitleDiv = styled.div`
    font-weight: bold;
`;

interface SupplProvisionAppdxComponentProps extends ELComponentProps { el: std.SupplProvisionAppdx, indent: number }

const isSupplProvisionAppdxComponentProps = (props: ELComponentProps): props is SupplProvisionAppdxComponentProps => props.el.tag === "SupplProvisionAppdx";

const SupplProvisionAppdxComponent = withCatcher<SupplProvisionAppdxComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    let ArithFormulaNum: std.ArithFormulaNum | null = null;
    let RelatedArticleNum: std.RelatedArticleNum | null = null;
    const ChildItems: std.ArithFormula[] = [];
    for (const child of el.children) {

        if (child.tag === "ArithFormulaNum") {
            ArithFormulaNum = child;

        } else if (child.tag === "RelatedArticleNum") {
            RelatedArticleNum = child;

        } else if (child.tag === "ArithFormula") {
            ChildItems.push(child);

        }
        else { assertNever(child); }
    }

    if (ArithFormulaNum || RelatedArticleNum) {
        blocks.push(
            <SupplProvisionAppdxTitleDiv
                className="law-anchor"
                data-el_id={el.id.toString()}
                key={(ArithFormulaNum || RelatedArticleNum || { id: 0 }).id}
            >
                {ArithFormulaNum && <RunComponent els={ArithFormulaNum.children} ls={props.ls} />}
                {RelatedArticleNum && <RunComponent els={RelatedArticleNum.children} ls={props.ls} />}
            </SupplProvisionAppdxTitleDiv>,
        );
    }

    for (const child of ChildItems) {
        blocks.push(
            <div style={{ marginLeft: `${indent + 1}em` }} key={child.id}>
                <ArithFormulaRunComponent el={child} ls={props.ls} />
            </div>,
        ); /* >>>> INDENT >>>> */
    }

    return (
        <SupplProvisionAppdxDiv>
            {blocks}
        </SupplProvisionAppdxDiv>
    );
});


interface SupplProvisionComponentProps extends ELComponentProps { el: std.SupplProvision, indent: number }

const isSupplProvisionComponentProps = (props: ELComponentProps): props is SupplProvisionComponentProps => props.el.tag === "SupplProvision";

const SupplProvisionComponent = withCatcher<SupplProvisionComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    let SupplProvisionLabel: std.SupplProvisionLabel | null = null;
    const ChildItems: Array<std.Chapter | std.Article | std.Paragraph | std.SupplProvisionAppdxTable | std.SupplProvisionAppdxStyle | std.SupplProvisionAppdx> = [];
    for (const child of el.children) {

        if (child.tag === "SupplProvisionLabel") {
            SupplProvisionLabel = child;

        } else if (child.tag === "Chapter" || child.tag === "Article" || child.tag === "Paragraph" || child.tag === "SupplProvisionAppdxTable" || child.tag === "SupplProvisionAppdxStyle" || child.tag === "SupplProvisionAppdx") {
            ChildItems.push(child);

        }
        else { assertNever(child); }
    }

    if (SupplProvisionLabel) {
        const Extract = el.attr.Extract === "true" ? `${MARGIN}抄` : "";
        const AmendLawNum = el.attr.AmendLawNum ? `（${el.attr.AmendLawNum}）` : "";
        blocks.push(
            <ArticleGroupTitleDiv
                style={{ marginLeft: `${indent + 3}em` }}
                key={SupplProvisionLabel.id}
            >
                <RunComponent els={SupplProvisionLabel.children} ls={props.ls} />{AmendLawNum}{Extract}
            </ArticleGroupTitleDiv>,
        );
    }

    for (const child of ChildItems) {
        if (child.tag === "Article") {
            blocks.push(<ArticleComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "Paragraph") {
            blocks.push(<ParagraphItemComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "Chapter") {
            blocks.push(<ArticleGroupComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "SupplProvisionAppdxTable") {
            blocks.push(<SupplProvisionAppdxTableComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "SupplProvisionAppdxStyle") {
            blocks.push(<SupplProvisionAppdxStyleComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "SupplProvisionAppdx") {
            blocks.push(<SupplProvisionAppdxComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        }
        else { assertNever(child); }
    }

    return (
        <div
            className="law-anchor"
            data-el_id={el.id.toString()}
            data-toplevel_container_info={JSON.stringify(containerInfoOf(el))}
        >
            {blocks}
        </div>
    );
});

interface ArticleGroupComponentProps extends ELComponentProps { el: std.MainProvision | std.Part | std.Chapter | std.Section | std.Subsection | std.Division, indent: number }

const isArticleGroupComponentProps = (props: ELComponentProps): props is ArticleGroupComponentProps => props.el.tag === "MainProvision" || props.el.tag === "Part" || props.el.tag === "Chapter" || props.el.tag === "Section" || props.el.tag === "Subsection" || props.el.tag === "Division";

const ArticleGroupComponent = withCatcher<ArticleGroupComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    let ArticleGroupTitle: std.PartTitle | std.ChapterTitle | std.SectionTitle | std.SubsectionTitle | std.DivisionTitle | null = null;
    const ChildItems: Array<std.Part | std.Chapter | std.Section | std.Subsection | std.Division | std.Article | std.Paragraph> = [];
    for (const child of el.children) {

        if (child.tag === "PartTitle" || child.tag === "ChapterTitle" || child.tag === "SectionTitle" || child.tag === "SubsectionTitle" || child.tag === "DivisionTitle") {
            ArticleGroupTitle = child;

        } else {
            ChildItems.push(child);

        }
    }

    if (ArticleGroupTitle) {
        blocks.push(<ArticleGroupTitleComponent el={ArticleGroupTitle} indent={indent} key={ArticleGroupTitle.id} ls={props.ls} />);
    }

    for (const child of ChildItems) {
        if (child.tag === "Article") {
            blocks.push(<ArticleComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "Paragraph") {
            blocks.push(<ParagraphItemComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "Part" || child.tag === "Chapter" || child.tag === "Section" || child.tag === "Subsection" || child.tag === "Division") {
            blocks.push(<ArticleGroupComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else {
            console.error(`unexpected element! ${JSON.stringify(child, undefined, 2)}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            blocks.push(<AnyLawComponent el={child} indent={indent} key={(child as any).id} ls={props.ls} />);

        }
    }

    return (
        el.tag === "MainProvision" ? (
            <div data-toplevel_container_info={JSON.stringify(containerInfoOf(el))}>
                {blocks}
            </div>
        ) : (
            <div
                className="law-anchor"
                data-el_id={el.id.toString()}
                key={el.id}
            >
                {blocks}
            </div>
        )
    );
});


const ArticleGroupTitleDiv = styled.div`
    clear: both;
    font-weight: bold;
    padding-top: 1em;
`;

interface ArticleGroupTitleComponentProps extends ELComponentProps { el: std.PartTitle | std.ChapterTitle | std.SectionTitle | std.SubsectionTitle | std.DivisionTitle, indent: number }

const isArticleGroupTitleComponentProps = (props: ELComponentProps): props is ArticleGroupTitleComponentProps => props.el.tag === "PartTitle" || props.el.tag === "ChapterTitle" || props.el.tag === "SectionTitle" || props.el.tag === "SubsectionTitle" || props.el.tag === "DivisionTitle";

const ArticleGroupTitleComponent = withCatcher<ArticleGroupTitleComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const titleIndent =
        el.tag === "PartTitle"
            ? 2
            : el.tag === "ChapterTitle"
                ? 3
                : el.tag === "SectionTitle"
                    ? 4
                    : el.tag === "SubsectionTitle"
                        ? 5
                        : el.tag === "DivisionTitle"
                            ? 6
                            : assertNever(el);
    return (
        <ArticleGroupTitleDiv style={{ marginLeft: `${indent + titleIndent}em` }}>
            <RunComponent els={el.children} ls={props.ls} />
        </ArticleGroupTitleDiv>
    );
});


const ArticleDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

interface ArticleComponentProps extends ELComponentProps { el: std.Article, indent: number }

const isArticleComponentProps = (props: ELComponentProps): props is ArticleComponentProps => props.el.tag === "Article";

const ArticleComponent = withCatcher<ArticleComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    let ArticleCaption: std.ArticleCaption | null = null;
    let ArticleTitle: std.ArticleTitle | null = null;
    const Paragraphs: std.Paragraph[] = [];
    const SupplNotes: std.SupplNote[] = [];
    for (const child of el.children) {

        if (child.tag === "ArticleCaption") {
            ArticleCaption = child;

        } else if (child.tag === "ArticleTitle") {
            ArticleTitle = child;

        } else if (child.tag === "Paragraph") {
            Paragraphs.push(child);

        } else if (std.isItem(child)) {
            console.error(`unexpected element! ${JSON.stringify(child, undefined, 2)}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Paragraphs.push(child as any);

        } else if (child.tag === "SupplNote") {
            SupplNotes.push(child);

        }
        else { assertNever(child); }
    }

    if (ArticleCaption) {
        blocks.push(
            <div style={{ marginLeft: `${indent + 1}em` }} key={ArticleCaption.id}>
                <RunComponent els={ArticleCaption.children} ls={props.ls} />
            </div>,
        ); /* >>>> INDENT >>>> */
    }

    for (let i = 0; i < Paragraphs.length; i++) {
        const Paragraph = Paragraphs[i];
        blocks.push(
            <ParagraphItemComponent
                el={Paragraph}
                indent={indent}
                ArticleTitle={(i === 0 && ArticleTitle) ? ArticleTitle : undefined}
                key={Paragraph.id}
                ls={props.ls}
            />,
        );
    }

    for (const SupplNote of SupplNotes) {
        blocks.push(
            <div style={{ marginLeft: `${indent + 2}em` }} key={SupplNote.id}>
                <RunComponent els={SupplNote.children} ls={props.ls} />
            </div>,
        ); /* >>>> INDENT ++++ INDENT >>>> */
    }

    return (
        <ArticleDiv
            className="law-anchor"
            data-el_id={el.id.toString()}
            data-container_info={JSON.stringify(containerInfoOf(el))}
        >
            {blocks}
        </ArticleDiv>
    );
});


const ParagraphDiv = styled.div`
    clear: both;
    border-left: 0.2em solid transparent;
    padding-left: 0.8em;
    margin-left: -1em;
    transition: border-left-color 0.3s;
    &:hover{
        border-left-color: rgba(255, 166, 0, 0.5);
    }
`;

const ItemDiv = styled.div`
    clear: both;
`;

interface ParagraphItemComponentProps extends ELComponentProps { el: std.Paragraph | std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10, indent: number, ArticleTitle?: std.ArticleTitle }

const isParagraphItemComponentProps = (props: ELComponentProps): props is ParagraphItemComponentProps => props.el.tag === "Paragraph" || props.el.tag === "Item" || props.el.tag === "Subitem1" || props.el.tag === "Subitem2" || props.el.tag === "Subitem3" || props.el.tag === "Subitem4" || props.el.tag === "Subitem5" || props.el.tag === "Subitem6" || props.el.tag === "Subitem7" || props.el.tag === "Subitem8" || props.el.tag === "Subitem9" || props.el.tag === "Subitem10";

const ParagraphItemComponent = withCatcher<ParagraphItemComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;
    const ArticleTitle = props.ArticleTitle;

    const blocks: JSX.Element[] = [];

    let ParagraphCaption: std.ParagraphCaption | null = null;
    let ParagraphItemTitle: std.ParagraphNum | std.ItemTitle | std.Subitem1Title | std.Subitem2Title | std.Subitem3Title | std.Subitem4Title | std.Subitem5Title | std.Subitem6Title | std.Subitem7Title | std.Subitem8Title | std.Subitem9Title | std.Subitem10Title | null = null;
    let ParagraphItemSentence: std.ParagraphSentence | std.ItemSentence | std.Subitem1Sentence | std.Subitem2Sentence | std.Subitem3Sentence | std.Subitem4Sentence | std.Subitem5Sentence | std.Subitem6Sentence | std.Subitem7Sentence | std.Subitem8Sentence | std.Subitem9Sentence | std.Subitem10Sentence | undefined;
    const Children: Array<std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10 | std.AmendProvision | std.Class | std.TableStruct | std.FigStruct | std.StyleStruct | std.List> = [];
    for (const child of el.children) {

        if (child.tag === "ParagraphCaption") {
            ParagraphCaption = child;

        } else if (std.isArticleCaption(child)) {
            console.error(`unexpected element! ${JSON.stringify(child, undefined, 2)}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ParagraphCaption = child as any;

        } else if (child.tag === "ParagraphNum" || child.tag === "ItemTitle" || child.tag ===
            "Subitem1Title" || child.tag === "Subitem2Title" || child.tag === "Subitem3Title" || child.tag === "Subitem4Title" || child.tag ===
            "Subitem5Title" || child.tag === "Subitem6Title" || child.tag === "Subitem7Title" || child.tag === "Subitem8Title" || child.tag ===
            "Subitem9Title" || child.tag === "Subitem10Title") {
            ParagraphItemTitle = child;

        } else if (child.tag === "ParagraphSentence" || child.tag === "ItemSentence" || child.tag ===
            "Subitem1Sentence" || child.tag === "Subitem2Sentence" || child.tag === "Subitem3Sentence" || child.tag === "Subitem4Sentence" || child.tag ===
            "Subitem5Sentence" || child.tag === "Subitem6Sentence" || child.tag === "Subitem7Sentence" || child.tag === "Subitem8Sentence" || child.tag ===
            "Subitem9Sentence" || child.tag === "Subitem10Sentence") {
            ParagraphItemSentence = child;

        } else {
            Children.push(child);

        }
    }

    if (ParagraphCaption) {
        blocks.push(
            <div style={{ marginLeft: `${indent + 1}em` }} key={ParagraphCaption.id}>
                <RunComponent els={ParagraphCaption.children} ls={props.ls} />
            </div>,
        ); /* >>>> INDENT >>>> */
    }

    const Title = (
        <span style={{ fontWeight: "bold" }}>
            {ParagraphItemTitle && <RunComponent els={ParagraphItemTitle.children} ls={props.ls} />}
            {ArticleTitle && <RunComponent els={ArticleTitle.children} ls={props.ls} />}
        </span>
    );
    const SentenceChildren = ParagraphItemSentence ? ParagraphItemSentence.children : [];
    blocks.push(
        <BlockSentenceComponent
            els={SentenceChildren}
            indent={indent}
            Title={Title}
            style={{ paddingLeft: "1em", textIndent: "-1em" }}
            key={-1}
            ls={props.ls}
        />,
    );

    for (const child of Children) {
        if (child.tag === "Item" || child.tag === "Subitem1" || child.tag === "Subitem2" || child.tag === "Subitem3" || child.tag === "Subitem4" || child.tag === "Subitem5" || child.tag === "Subitem6" || child.tag === "Subitem7" || child.tag === "Subitem8" || child.tag === "Subitem9" || child.tag === "Subitem10") {
            blocks.push(<ParagraphItemComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "TableStruct") {
            blocks.push(<TableStructComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "FigStruct") {
            blocks.push(<FigStructComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "StyleStruct") {
            blocks.push(<StyleStructComponent el={child} indent={indent + 1} key={child.id} ls={props.ls} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "List") {
            blocks.push(<ListComponent el={child} indent={indent + 2} key={child.id} ls={props.ls} />); /* >>>> INDENT ++++ INDENT >>>> */

        } else if (child.tag === "AmendProvision") {
            blocks.push(<AmendProvisionComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "Class") {
            throw new NotImplementedError(child.tag);

        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            blocks.push(<AnyLawComponent el={child} indent={indent} key={(child as any).id} ls={props.ls} />);

        }
    }

    if (el.tag === "Paragraph") {
        if (ArticleTitle) {
            return <ParagraphDiv className={`paragraph-item-${el.tag}`}>{blocks}</ParagraphDiv>;
        } else {
            return (
                <ParagraphDiv
                    data-container_info={JSON.stringify(containerInfoOf(el))}
                    className={`paragraph-item-${el.tag}`}
                >
                    {blocks}
                </ParagraphDiv>
            );
        }
    } else {
        return <ItemDiv className={`paragraph-item-${el.tag}`}>{blocks}</ItemDiv>;
    }
});

interface ListComponentProps extends ELComponentProps { el: std.List | std.Sublist1 | std.Sublist2 | std.Sublist3, indent: number }

const isListComponentProps = (props: ELComponentProps): props is ListComponentProps => props.el.tag === "List" || props.el.tag === "Sublist1" || props.el.tag === "Sublist2" || props.el.tag === "Sublist3";

const ListComponent = withCatcher<ListComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    for (const child of el.children) {

        if (child.tag === "ListSentence" || child.tag === "Sublist1Sentence" || child.tag === "Sublist2Sentence" || child.tag === "Sublist3Sentence") {
            blocks.push(<BlockSentenceComponent els={child.children} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "Sublist1" || child.tag === "Sublist2" || child.tag === "Sublist3") {
            blocks.push(<ListComponent el={child} indent={indent + 2} key={child.id} ls={props.ls} />); /* >>>> INDENT ++++ INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return <>{blocks}</>;
});


interface TableStructComponentProps extends ELComponentProps { el: std.TableStruct, indent: number }

const isTableStructComponentProps = (props: ELComponentProps): props is TableStructComponentProps => props.el.tag === "TableStruct";

const TableStructComponent = withCatcher<TableStructComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    for (const child of el.children) {

        if (child.tag === "TableStructTitle") {
            blocks.push(
                <div style={{ marginLeft: `${indent}em` }} key={child.id}>
                    <RunComponent els={child.children} ls={props.ls} />
                </div>,
            );

        } else if (child.tag === "Table") {
            blocks.push(<TableComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "Remarks") {
            blocks.push(<RemarksComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        }
        else { assertNever(child); }
    }

    return <>{blocks}</>;
});


const Table = styled.table`
    border-collapse: collapse;
    text-indent: 0;
    table-layout: fixed;
    width: 100%;
`;

interface TableComponentProps extends ELComponentProps { el: std.Table, indent: number }

const isTableComponentProps = (props: ELComponentProps): props is TableComponentProps => props.el.tag === "Table";

const TableComponent = withCatcher<TableComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const rows: JSX.Element[] = [];

    for (const child of el.children) {

        if (child.tag === "TableRow" || child.tag === "TableHeaderRow") {
            rows.push(<TableRowComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        }
        else { assertNever(child); }
    }

    return (
        <div style={{ marginLeft: `${indent}em` }}>
            <Table>
                <tbody>
                    {rows}
                </tbody>
            </Table>
        </div>
    );
});


interface RemarksComponentProps extends ELComponentProps { el: std.Remarks, indent: number }

const isRemarksComponentProps = (props: ELComponentProps): props is RemarksComponentProps => props.el.tag === "Remarks";

const RemarksComponent = withCatcher<RemarksComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    let RemarksLabel: std.RemarksLabel | null = null;
    const ChildItems: Array<std.Item | std.Sentence> = [];
    for (const child of el.children) {

        if (child.tag === "RemarksLabel") {
            RemarksLabel = child;

        } else if (child.tag === "Item" || child.tag === "Sentence") {
            ChildItems.push(child);

        } else { assertNever(child); }
    }

    for (let i = 0; i < ChildItems.length; i++) {
        const child = ChildItems[i];

        if (child.tag === "Sentence") {
            blocks.push(
                <BlockSentenceComponent
                    els={[child]}
                    Title={(i === 0 && RemarksLabel && <RunComponent els={RemarksLabel.children} style={{ fontWeight: "bold" }} ls={props.ls} />) || undefined}
                    indent={0}
                    key={child.id}
                    ls={props.ls}
                />,
            );

        } else if (child.tag === "Item") {
            if (i === 0 && RemarksLabel) {
                blocks.push(
                    <NoMarginDiv key={RemarksLabel.id}>
                        <RunComponent els={RemarksLabel.children} style={{ fontWeight: "bold" }} ls={props.ls} />
                    </NoMarginDiv>,
                );
            }
            blocks.push(<ParagraphItemComponent el={child} indent={1} key={child.id} ls={props.ls} />);

        }
        else { assertNever(child); }
    }

    return (
        <div style={{ marginLeft: `${indent}em` }}>
            {blocks}
        </div>
    );
});

interface TableRowComponentProps extends ELComponentProps { el: std.TableRow | std.TableHeaderRow, indent: number }

const isTableRowComponentProps = (props: ELComponentProps): props is TableRowComponentProps => props.el.tag === "TableRow" || props.el.tag === "TableHeaderRow";

const TableRowComponent = withCatcher<TableRowComponentProps>(props => {
    const el = props.el;
    // const indent = props.indent;

    const columns: JSX.Element[] = [];

    for (const child of el.children) {

        if (child.tag === "TableColumn" || child.tag === "TableHeaderColumn") {
            columns.push(<TableColumnComponent el={child} indent={1} key={child.id} ls={props.ls} />);

        }
        else { assertNever(child); }
    }

    return (
        <tr>
            {columns}
        </tr>
    );
});


const Td = styled.td`
    border: 1px solid black;
    min-height: 1em;
    height: 1em;
`;

const Th = styled.th`
    border: 1px solid black;
    min-height: 1em;
    height: 1em;
`;

interface TableColumnComponentProps extends ELComponentProps { el: std.TableColumn | std.TableHeaderColumn, indent: number }

const isTableColumnComponentProps = (props: ELComponentProps): props is TableColumnComponentProps => props.el.tag === "TableColumn" || props.el.tag === "TableHeaderColumn";

const TableColumnComponent = withCatcher<TableColumnComponentProps>(props => {
    const el = props.el;
    // const indent = props.indent;

    const blocks: JSX.Element[] = [];

    if (el.tag === "TableHeaderColumn") {
        blocks.push(
            <NoMarginDiv key={el.id}>
                <RunComponent els={el.children} ls={props.ls} />
            </NoMarginDiv>,
        );

    } else if (el.tag === "TableColumn") {
        for (const child of el.children) {

            if (child.tag === "Sentence" || child.tag === "Column") {
                blocks.push(<BlockSentenceComponent els={[child]} indent={0} key={child.id} ls={props.ls} />);

            } else if (child.tag === "FigStruct") {
                blocks.push(<FigStructComponent el={child} indent={0} key={child.id} ls={props.ls} />);

            } else if (child.tag === "Remarks") {
                blocks.push(<RemarksComponent el={child} indent={0} key={child.id} ls={props.ls} />);

            } else if (child.tag === "Part" || child.tag === "Chapter" || child.tag === "Section" || child.tag === "Subsection" || child.tag === "Division") {
                blocks.push(<ArticleGroupComponent el={child} indent={0} key={child.id} ls={props.ls} />);

            } else if (child.tag === "Article") {
                blocks.push(<ArticleComponent el={child} indent={0} key={child.id} ls={props.ls} />);

            } else if (child.tag === "Paragraph" || child.tag === "Item" || child.tag === "Subitem1" || child.tag === "Subitem2" || child.tag === "Subitem3" || child.tag === "Subitem4" || child.tag === "Subitem5" || child.tag === "Subitem6" || child.tag === "Subitem7" || child.tag === "Subitem8" || child.tag === "Subitem9" || child.tag === "Subitem10") {
                blocks.push(<ParagraphItemComponent el={child} indent={0} key={child.id} ls={props.ls} />);
            }
            else { assertNever(child); }
        }

    }
    else { assertNever(el); }

    if (el.tag === "TableColumn") {
        const style: React.CSSProperties = {};
        if (el.attr.BorderTop) style.borderTopStyle = el.attr.BorderTop;
        if (el.attr.BorderBottom) style.borderBottomStyle = el.attr.BorderBottom;
        if (el.attr.BorderLeft) style.borderLeftStyle = el.attr.BorderLeft;
        if (el.attr.BorderRight) style.borderRightStyle = el.attr.BorderRight;
        if (el.attr.Align) style.textAlign = el.attr.Align;
        if (el.attr.Valign) style.verticalAlign = el.attr.Valign;
        return (
            <Td
                rowSpan={el.attr.rowspan ? Number(el.attr.rowspan) : undefined}
                colSpan={el.attr.colspan ? Number(el.attr.colspan) : undefined}
                style={style}
            >
                {blocks}
            </Td>
        );
    } else {
        return (
            <Th>
                {blocks}
            </Th>
        );
    }
});


interface NoteStyleFormatComponentProps extends ELComponentProps { el: std.Note | std.Style | std.Format, indent: number }

const isNoteStyleFormatComponentProps = (props: ELComponentProps): props is NoteStyleFormatComponentProps => props.el.tag === "Note" || props.el.tag === "Style" || props.el.tag === "Format";

const NoteStyleFormatComponent = withCatcher<NoteStyleFormatComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    for (const [i, child] of el.children.entries()) {
        if ((typeof child === "string") || std.isLine(child) || std.isQuoteStruct(child) || std.isArithFormula(child) || std.isRuby(child) || std.isSup(child) || std.isSub(child) || isControl(child)) {
            blocks.push(<RunComponent els={[child]} key={(typeof child === "string") ? i : child.id} ls={props.ls} />);

        } else if (std.isSentence(child)) {
            blocks.push(
                <div style={{ marginLeft: `${indent}em` }} key={child.id}>
                    <RunComponent els={child.children} ls={props.ls} />
                </div>,
            );

        } else if (std.isParagraph(child)) {
            blocks.push(<ParagraphItemComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (std.isItem(child)) {
            blocks.push(<ParagraphItemComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (std.isTable(child)) {
            blocks.push(<TableComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (std.isTableStruct(child)) {
            blocks.push(<TableStructComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (std.isFigStruct(child)) {
            blocks.push(<FigStructComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (std.isFig(child)) {
            blocks.push(
                <div style={{ marginLeft: `${indent}em` }} key={child.id}>
                    <FigRunComponent el={child} ls={props.ls} />
                </div>,
            );

            // } else if (std.isArithFormula(child)) {
            //     blocks.push(
            //         <div style={{ marginLeft: `${indent}em` }} key={child.id}>
            //             <ArithFormulaRunComponent el={child} />
            //         </div>,
            //     );

        } else if (std.isList(child)) {
            blocks.push(<ListComponent el={child} indent={indent + 2} key={child.id} ls={props.ls} />); /* >>>> INDENT ++++ INDENT >>>> */

        } else if (std.isStyle(child)) {
            blocks.push(<NoteStyleFormatComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else {
            throw new NotImplementedError(child.tag);

        }
    }

    return <>{blocks}</>;
});


interface StyleStructComponentProps extends ELComponentProps { el: std.StyleStruct, indent: number }

const isStyleStructComponentProps = (props: ELComponentProps): props is StyleStructComponentProps => props.el.tag === "StyleStruct";

const StyleStructComponent = withCatcher<StyleStructComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    for (const child of el.children) {

        if (child.tag === "StyleStructTitle") {
            blocks.push(
                <div style={{ marginLeft: `${indent}em` }} key={child.id}>
                    <RunComponent els={child.children} ls={props.ls} />
                </div>,
            );

        } else if (child.tag === "Style") {
            blocks.push(<NoteStyleFormatComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "Remarks") {
            blocks.push(<RemarksComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        }
        else { assertNever(child); }
    }

    return <>{blocks}</>;
});


interface FormatStructComponentProps extends ELComponentProps { el: std.FormatStruct, indent: number }

const isFormatStructComponentProps = (props: ELComponentProps): props is FormatStructComponentProps => props.el.tag === "FormatStruct";

const FormatStructComponent = withCatcher<FormatStructComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    for (const child of el.children) {

        if (child.tag === "FormatStructTitle") {
            blocks.push(
                <div style={{ marginLeft: `${indent}em` }} key={child.id}>
                    <RunComponent els={child.children} ls={props.ls} />
                </div>,
            );

        } else if (child.tag === "Format") {
            blocks.push(<NoteStyleFormatComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "Remarks") {
            blocks.push(<RemarksComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        }
        else { assertNever(child); }
    }

    return <>{blocks}</>;
});


interface NoteStructComponentProps extends ELComponentProps { el: std.NoteStruct, indent: number }

const isNoteStructComponentProps = (props: ELComponentProps): props is NoteStructComponentProps => props.el.tag === "NoteStruct";

const NoteStructComponent = withCatcher<NoteStructComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    for (const child of el.children) {

        if (child.tag === "NoteStructTitle") {
            blocks.push(
                <div style={{ marginLeft: `${indent}em` }} key={child.id}>
                    <RunComponent els={child.children} ls={props.ls} />
                </div>,
            );

        } else if (child.tag === "Note") {
            blocks.push(<NoteStyleFormatComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (child.tag === "Remarks") {
            blocks.push(<RemarksComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        }
        else { assertNever(child); }
    }

    return <>{blocks}</>;
});

interface ArithFormulaRunComponentProps extends ELComponentProps { el: std.ArithFormula }

const isArithFormulaRunComponentProps = (props: ELComponentProps): props is ArithFormulaRunComponentProps => props.el.tag === "ArithFormula";

const ArithFormulaRunComponent = withCatcher<ArithFormulaRunComponentProps>(props => {
    const el = props.el;

    const blocks: JSX.Element[] = [];

    for (const [i, child] of el.children.entries()) {
        if ((typeof child === "string") || std.isLine(child) || std.isQuoteStruct(child) || std.isArithFormula(child) || std.isRuby(child) || std.isSup(child) || std.isSub(child) || isControl(child)) {
            blocks.push(<RunComponent els={[child]} key={(typeof child === "string") ? i : child.id} ls={props.ls} />);

        } else if (std.isFigStruct(child)) {
            blocks.push(<FigStructComponent el={child} indent={0} key={child.id} ls={props.ls} />);

        } else if (std.isFig(child)) {
            blocks.push(
                <NoMarginDiv key={child.id}>
                    <FigRunComponent el={child} ls={props.ls} />
                </NoMarginDiv>,
            );

        } else if (std.isList(child)) {
            blocks.push(<ListComponent el={child} indent={0} key={child.id} ls={props.ls} />);

        } else if (std.isSentence(child)) {
            blocks.push(
                <NoMarginDiv key={child.id}>
                    <RunComponent els={child.children} ls={props.ls} />
                </NoMarginDiv>,
            );

        } else if (std.isRemarks(child)) {
            blocks.push(<RemarksComponent el={child} indent={0} key={child.id} ls={props.ls} />);

        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            blocks.push(<AnyLawComponent el={child as any} indent={0} key={child.id} ls={props.ls} />);

        }
    }

    return (
        <span style={{ display: "inline-block" }}>
            {blocks}
        </span>
    );
});


interface FigStructComponentProps extends ELComponentProps { el: std.FigStruct, indent: number }

const isFigStructComponentProps = (props: ELComponentProps): props is FigStructComponentProps => props.el.tag === "FigStruct";

const FigStructComponent = withCatcher<FigStructComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    for (const child of el.children) {

        if (child.tag === "FigStructTitle") {
            blocks.push(
                <div style={{ marginLeft: `${indent}em` }} key={child.id}>
                    <RunComponent els={child.children} ls={props.ls} />
                </div>,
            );

        } else if (child.tag === "Fig") {
            blocks.push(
                <div style={{ marginLeft: `${indent}em` }} key={child.id}>
                    <FigRunComponent el={child} ls={props.ls} />
                </div>,
            );

        } else if (child.tag === "Remarks") {
            blocks.push(<RemarksComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        }
        else { assertNever(child); }
    }

    return <>{blocks}</>;
});

const FigIframe = styled.iframe`
    width: 100%;
    height: 80vh;
    border: 1px solid gray;
`;

const FigIframeDummy = styled.div`
    display: inline-block;
    width: 100%;
    height: 80vh;
    border: 1px solid gray;
`;

const FigImg = styled.img`
    max-width: 100%;
`;

const FigImgDummy = styled.div`
    display: inline-block;
    width: 10em;
    height: 10em;
`;

interface FigRunComponentProps extends ELComponentProps { el: std.Fig }

const isFigRunComponentProps = (props: ELComponentProps): props is FigRunComponentProps => props.el.tag === "Fig";

const FigRunComponent = withCatcher<FigRunComponentProps>(props => {
    const { el, ls: { lawData } } = props;

    const [ srcInfo, setSrcInfo ] = React.useState<{
        url: string,
        type: string,
    } | null>(null);

    React.useEffect(() => {
        const cleaners: (() => unknown)[] = [];
        if (lawData.source === "elaws" && lawData.pict) {
            const blob = lawData.pict.get(el.attr.src);
            if (blob) {
                const url = URL.createObjectURL(blob);
                setSrcInfo({ url, type: blob.type });
                cleaners.push(() => URL.revokeObjectURL(url));
            }
        } else if (lawData.source === "stored") {
            (async () => {
                const url = path.join(storedLoader.lawdataPath, lawData.lawPath, el.attr.src);
                const res = await fetch(url, { method: "HEAD" });
                if (!res.ok) return;
                setSrcInfo({ url, type: res.headers.get("Content-Type") ?? "" });
            })();
        }
        return () => {
            for (const cleaner of cleaners) cleaner();
        };
    }, [lawData, el, setSrcInfo]);

    if (el.children.length > 0) {
        throw new NotImplementedError(el.outerXML());
    }

    const { observed, observedRef } = useObserved();

    return <span ref={observedRef}>
        {srcInfo === null ? (
            <>[{el.attr.src}]</>
        ) : srcInfo.type.includes("pdf") ? (
            observed ? (
                <FigIframe src={srcInfo.url} />
            ) : (
                <FigIframeDummy>[{el.attr.src}]</FigIframeDummy>
            )
        ) : srcInfo.type.startsWith("image/") ? (
            observed ? (
                <FigImg src={srcInfo.url} />
            ) : (
                <FigImgDummy>[{el.attr.src}]</FigImgDummy>
            )
        ) : (
            <a href={srcInfo.url} type={srcInfo.type} target="_blank" rel="noreferrer">{el.attr.src}</a>
        )}
    </span>;
});

interface QuoteStructRunComponentProps extends ELComponentProps { el: std.QuoteStruct }

const isQuoteStructRunComponentProps = (props: ELComponentProps): props is QuoteStructRunComponentProps => props.el.tag === "QuoteStruct";

const QuoteStructRunComponent = withCatcher<QuoteStructRunComponentProps>(props => {
    const el = props.el;

    const blocks: JSX.Element[] = [];

    for (const [i, child] of el.children.entries()) {
        if (typeof child === "string") {
            blocks.push(<RunComponent els={[child]} key={i} ls={props.ls} />);

        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            blocks.push(<AnyLawComponent el={child as any} indent={0} key={child.id} ls={props.ls} />);

        }
    }

    return (
        <span style={{ display: "inline-block" }}>
            {blocks}
        </span>
    );
});


interface AmendProvisionComponentProps extends ELComponentProps { el: std.AmendProvision, indent: number }

const isAmendProvisionComponentProps = (props: ELComponentProps): props is AmendProvisionComponentProps => props.el.tag === "AmendProvision";

const AmendProvisionComponent = withCatcher<AmendProvisionComponentProps>(props => {
    const el = props.el;
    const indent = props.indent;

    const blocks: JSX.Element[] = [];

    for (const child of el.children) {

        if (child.tag === "AmendProvisionSentence") {
            blocks.push(<BlockSentenceComponent els={child.children} indent={indent} style={{ textIndent: "1em" }} key={child.id} ls={props.ls} />);

        } else if (child.tag === "NewProvision") {
            for (const subchild of child.children) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                blocks.push(<AnyLawComponent {...{ el: subchild, indent: indent + 1 } as any} key={subchild.id} />);
            }

        }
        else { assertNever(child); }
    }

    return <>{blocks}</>;
});


interface SentenceDummyProps extends ELComponentProps { el: std.Sentence, indent: number }

const isSentenceDummyProps = (props: ELComponentProps): props is SentenceDummyProps => props.el.tag === "Sentence";


const FirstColumnSpan = styled.span`
    color: rgb(121, 113, 0);
`;

interface BlockSentenceComponentProps { els: Array<std.Sentence | std.Column | std.Table>, indent: number, Title?: JSX.Element, style?: React.CSSProperties }

const BlockSentenceComponent = withCatcher<BlockSentenceComponentProps>(props => {
    const els = props.els;
    const indent = props.indent;
    const Title = props.Title;
    const style = props.style;

    const runs: JSX.Element[] = [];

    if (Title) {
        runs.push(<span key={-2}>{Title}</span>);
        runs.push(<span key={-1}>{MARGIN}</span>);
    }

    for (let i = 0; i < els.length; i++) {
        const el = els[i];

        if (el.tag === "Sentence") {
            runs.push(<RunComponent els={el.children} key={i * 2} ls={props.ls} />);

        } else if (el.tag === "Column") {
            if (i !== 0) {
                runs.push(<span key={i * 2}>{MARGIN}</span>);
            }

            const subruns: JSX.Element[] = [];
            for (let j = 0; j < el.children.length; j++) {
                const subel = el.children[j];
                subruns.push(<RunComponent els={subel.children} key={j} ls={props.ls} />);
            }

            if (i === 0) {
                runs.push(<FirstColumnSpan key={i * 2 + 1}>{subruns}</FirstColumnSpan>);
            } else {
                runs.push(<span key={i * 2 + 1}>{subruns}</span>);
            }

        } else if (el.tag === "Table") {
            throw new NotImplementedError(el.tag);

        }
        else { assertNever(el); }
    }

    return (
        <div style={{ marginLeft: `${indent}em`, ...style }}>
            {runs}
        </div>
    );
});


interface RunComponentProps { els: Array<string | std.Line | std.QuoteStruct | std.ArithFormula | std.Ruby | std.Sup | std.Sub | std.__EL>, style?: React.CSSProperties }

const RunComponent = withCatcher<RunComponentProps>(props => {
    const els = props.els;
    const style = props.style;

    const { observed, observedRef, forceObserved } = useObserved();

    React.useEffect(() => {
        props.ls.addAfterMountTask(forceObserved);
    }, [forceObserved, props.ls]);

    const runs: JSX.Element[] = [];

    for (let i = 0; i < els.length; i++) {
        const _el = els[i];

        if (typeof _el === "string" || _el instanceof String) {
            runs.push(<span key={i}>{_el}</span>);

        } else if (_el.isControl) {
            if (observed) {
                runs.push(<ControlRunComponent el={_el} key={i} ls={props.ls} />);
            } else {
                runs.push(<span key={i}>{_el.text}</span>);
            }

        } else {
            const el: std.Line | std.QuoteStruct | std.ArithFormula | std.Ruby | std.Sup | std.Sub = _el;
            if (el.tag === "Ruby") {
                const rb = el.children
                    .map(c =>
                        (typeof c === "string")
                            ? c
                            : !std.isRt(c)
                                ? c.text
                                : "",
                    ).join("");
                const rt = (el.children
                    .filter(c => !(typeof c === "string") && std.isRt(c)) as std.Rt[])
                    .map(c => c.text)
                    .join("");
                runs.push(<ruby key={i}>{rb}<rt>{rt}</rt></ruby>);

            } else if (el.tag === "Sub") {
                runs.push(<sub key={i}>{el.text}</sub>);

            } else if (el.tag === "Sup") {
                runs.push(<sup key={i}>{el.text}</sup>);

            } else if (el.tag === "QuoteStruct") {
                runs.push(<QuoteStructRunComponent el={el} key={i} ls={props.ls} />);

            } else if (el.tag === "ArithFormula") {
                runs.push(<ArithFormulaRunComponent el={el} key={i} ls={props.ls} />);

            } else if (el.tag === "Line") {
                throw new NotImplementedError(el.tag);

            }
            else { assertNever(el); }
        }
    }

    return <span style={style} ref={observedRef}>{runs}</span>;
});


type InlineEL = string | std.Line | std.QuoteStruct | std.ArithFormula | std.Ruby | std.Sup | std.Sub;
const isInlineEL = (obj: string | EL): obj is InlineEL => {
    return (typeof obj === "string" || obj instanceof String) || obj.tag === "Line" || obj.tag === "QuoteStruct" || obj.tag === "Ruby" || obj.tag === "Sup" || obj.tag === "Sub";
};
const isControl = (obj: string | EL): obj is std.__EL => {
    return !(typeof obj === "string" || obj instanceof String) && obj.isControl;
};

const getInnerRun = (el: EL, ls: BaseLawCommonState) => {

    const ChildItems: Array<InlineEL | std.__EL> = [];

    for (const child of el.children) {

        if (isInlineEL(child) || isControl(child)) {
            ChildItems.push(child);
        } else {
            throw new NotImplementedError(el.tag);

        }
    }

    return <RunComponent els={ChildItems} ls={ls} />;
};

interface ControlRunComponentProps extends ELComponentProps { el: std.__EL }

// const isControlRunComponentProps = (props: ELComponentProps): props is ControlRunComponentProps => props.el.isControl;

const ControlRunComponent = withCatcher<ControlRunComponentProps>(props => {
    const el = props.el;

    if (el.tag === "____Declaration") {
        return <____DeclarationComponent el={el} ls={props.ls} />;

    } else if (el.tag === "____VarRef") {
        return <____VarRefComponent el={el} ls={props.ls} />;

    } else if (el.tag === "____LawNum") {
        return <____LawNumComponent el={el} ls={props.ls} />;

    } else if (el.tag === "__Parentheses") {
        return <__ParenthesesComponent el={el} ls={props.ls} />;

    } else if (el.tag === "__PStart") {
        return <__PStartComponent el={el} ls={props.ls} />;

    } else if (el.tag === "__PContent") {
        return <__PContentComponent el={el} ls={props.ls} />;

    } else if (el.tag === "__PEnd") {
        return <__PEndComponent el={el} ls={props.ls} />;

    } else if (el.tag === "__MismatchStartParenthesis") {
        return <__MismatchStartParenthesisComponent el={el} ls={props.ls} />;

    } else if (el.tag === "__MismatchEndParenthesis") {
        return <__MismatchEndParenthesisComponent el={el} ls={props.ls} />;

    } else {
        return getInnerRun(el, props.ls);
    }
});


const DeclarationSpan = styled.span`
    color: rgb(40, 167, 69);
`;

interface ____DeclarationComponentProps extends ELComponentProps { el: std.__EL }

const ____DeclarationComponent = withCatcher<____DeclarationComponentProps>(props => {
    const el = props.el;
    return (
        <DeclarationSpan
            data-lawtext_declaration_index={el.attr.declaration_index}
        >
            {getInnerRun(el, props.ls)}
        </DeclarationSpan>
    );
});


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

const VarRefFloatBlockInnerSpan = styled.span`
    float: right;
    width: 100%;
    font-size: 1rem;
    padding: 0.5em;
`;

const VarRefArrowSpan = styled.span`
    position: absolute;
    border-style: solid;
    border-width: 0 0.5em 0.5em 0.5em;
    border-color: transparent transparent rgba(127, 127, 127, 0.15) transparent;
    margin: -0.5em 0 0 0;
`;

const VarRefWindowSpan = styled.span`
    float: right;
    width: 100%;
    padding: 0.5em;
    border-radius: 0.2em;
    background-color: rgba(127, 127, 127, 0.15);
`;

interface ____VarRefComponentProps extends ELComponentProps { el: std.__EL }

interface ____VarRefComponentState { mode: VarRefFloatState, arrowLeft: string }

const ____VarRefComponent = withCatcher<____VarRefComponentProps>(props => {
    const refText = React.useRef<HTMLSpanElement>(null);
    const refWindow = React.useRef<HTMLSpanElement>(null);

    const [state, setState] = React.useState<____VarRefComponentState>({ mode: VarRefFloatState.HIDDEN, arrowLeft: "0" });

    React.useEffect(() => {
        window.addEventListener("resize", updateSize);
        return () => {
            window.removeEventListener("resize", updateSize);
        };
    }, []);

    const varRefTextSpanOnClick = (/* e: React.MouseEvent<HTMLSpanElement> */) => {
        if (state.mode === VarRefFloatState.OPEN) {
            setState(prevState => ({ ...prevState, mode: VarRefFloatState.CLOSED }));
        } else {
            setState(prevState => ({ ...prevState, mode: VarRefFloatState.OPEN }));
            setTimeout(() => {
                updateSize();
            }, 30);
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

    return (
        <VarRefSpan>

            <VarRefTextSpan onClick={varRefTextSpanOnClick} ref={refText}>
                {getInnerRun(props.el, props.ls)}
            </VarRefTextSpan>

            <AnimateHeight
                height={state.mode === VarRefFloatState.OPEN ? "auto" : 0}
                style={{
                    float: "right",
                    width: "100%",
                    padding: 0,
                    margin: 0,
                    textIndent: 0,
                    fontSize: 0,
                    fontWeight: "normal",
                    overflow: "hidden",
                    position: "relative",
                    color: "initial",
                }}
                onAnimationEnd={animateHeightOnAnimationEnd}
            >
                {(state.mode !== VarRefFloatState.HIDDEN) && (
                    <VarRefFloatBlockInnerSpan>
                        <VarRefArrowSpan style={{ marginLeft: state.arrowLeft }} />
                        <VarRefWindowSpan ref={refWindow}>
                            <VarRefView el={props.el} ls={props.ls} />
                        </VarRefWindowSpan>
                    </VarRefFloatBlockInnerSpan>
                )}
            </AnimateHeight>

        </VarRefSpan>
    );
});


interface VarRefViewProps extends ELComponentProps { el: std.__EL }

const VarRefView = withCatcher<VarRefViewProps>(props => {
    const el = props.el;

    const analysis = props.ls.lawData.analysis;
    if (!analysis) return null;

    const declarationIndex = Number(el.attr.ref_declaration_index);
    const declaration = analysis.declarations.get(declarationIndex);
    const declContainer = declaration.namePos.env.container;
    const containerStack = declContainer.linealAscendant(c => {
        if (std.isParagraph(c.el)) {
            const paragraphNum = c.el.children.find(cc => std.isParagraphNum(cc));
            if (!c.parent) return true;
            if (
                std.isArticle(c.parent.el) &&
                c.parent.children.filter(pc => std.isParagraph(pc.el)).length === 1 &&
                paragraphNum && paragraphNum.text === ""
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
    let lastContainerEl = declContainer.el;

    const titleTags = [
        "ArticleTitle",
        "ParagraphNum",
        "ItemTitle",
        "Subitem1Title",
        "Subitem2Title",
        "Subitem3Title",
        "Subitem4Title",
        "Subitem5Title",
        "Subitem6Title",
        "Subitem7Title",
        "Subitem8Title",
        "Subitem9Title",
        "Subitem10Title",
        "TableStructTitle",
    ];
    const ignoreTags = ["ArticleCaption", "ParagraphCaption", ...titleTags];

    for (const container of containerStack) {
        if (std.isEnactStatement(container.el)) {
            names.push("（制定文）");

        } else if (std.isArticle(container.el)) {
            const articleTitle = container.el.children
                .find(child => child.tag === "ArticleTitle") as std.ArticleTitle;
            if (articleTitle) names.push(articleTitle.text);

        } else if (std.isParagraph(container.el)) {
            const paragraphNum = container.el.children
                .find(child => child.tag === "ParagraphNum") as std.ParagraphNum;
            if (paragraphNum) names.push(paragraphNum.text || "１");

        } else if (std.isItem(container.el) || std.isSubitem1(container.el) || std.isSubitem2(container.el) || std.isSubitem3(container.el) || std.isSubitem4(container.el) || std.isSubitem5(container.el) || std.isSubitem6(container.el) || std.isSubitem7(container.el) || std.isSubitem8(container.el) || std.isSubitem9(container.el) || std.isSubitem10(container.el)) {
            const itemTitle = (container.el.children as EL[])
                .find(child => child.tag === `${container.el.tag}Title`);
            if (itemTitle) names.push(itemTitle.text);

        } else if (std.isTableStruct(container.el)) {
            const tableStructTitleEl = container.el.children
                .find(child => child.tag === "TableStructTitle");
            const tableStructTitle = tableStructTitleEl
                ? tableStructTitleEl.text
                : "表";
            names.push(tableStructTitle + "（抜粋）");

        } else {
            continue;
        }
        lastContainerEl = container.el;
    }

    const declElTitleTag = titleTags
        .find(s => Boolean(s) && s.startsWith(lastContainerEl.tag));

    if (declElTitleTag) {
        const declEl = new EL(
            lastContainerEl.tag,
            {},
            [
                new EL(declElTitleTag, {}, [names.join("／")]),
                ...(lastContainerEl.children as EL[])
                    .filter(child => ignoreTags.indexOf(child.tag) < 0),
            ],
        );

        if (std.isArticle(declEl)) {
            return <ArticleComponent el={declEl} indent={0} ls={props.ls} />;

        } else if (std.isParagraph(declEl) || std.isItem(declEl) || std.isSubitem1(declEl) || std.isSubitem2(declEl) || std.isSubitem3(declEl) || std.isSubitem4(declEl) || std.isSubitem5(declEl) || std.isSubitem6(declEl) || std.isSubitem7(declEl) || std.isSubitem8(declEl) || std.isSubitem9(declEl) || std.isSubitem10(declEl)) {
            return <ParagraphItemComponent el={declEl} indent={0} ls={props.ls} />;

        } else if (std.isTable(declEl)) {
            return <TableComponent el={declEl} indent={0} ls={props.ls} />;

        } else {
            throw new NotImplementedError(declEl.tag);

        }
    } else if (std.isEnactStatement(lastContainerEl)) {
        return (
            <div style={{ paddingLeft: "1em", textIndent: "-1em" }}>
                <span>{names.join("／")}</span>
                <span>{MARGIN}</span>
                <RunComponent els={lastContainerEl.children} ls={props.ls} />
            </div>
        );

    } else {
        throw new NotImplementedError(lastContainerEl.tag);

    }
});


const LawNumA = styled.a`
`;

interface ____LawNumComponentProps extends ELComponentProps { el: std.__EL }

const ____LawNumComponent = withCatcher<____LawNumComponentProps>(props => {
    const el = props.el;
    return (
        <LawNumA href={`#${el.text}`} target="_blank">
            {getInnerRun(el, props.ls)}
        </LawNumA>
    );
});


const GlobalStyle = createGlobalStyle`
.lawtext-varref-open .lawtext-varref-text {
    background-color: rgba(127, 127, 127, 0.15);
    border-bottom: 1px solid rgb(40, 167, 69);
}

.lawtext-varref-text:hover {
    background-color: rgb(255, 249, 160);
    border-bottom: 1px solid rgb(40, 167, 69);
}

.lawtext-analyzed-parentheses
{
    transition: background-color 0.3s;
}

.lawtext-analyzed-parentheses:hover,
.paragraph-item-Paragraph:hover .lawtext-analyzed-parentheses
{
    background-color: hsla(60, 100%, 50%, 0.1);
}

.lawtext-analyzed-parentheses[data-lawtext_parentheses_depth="1"]:hover,
.paragraph-item-Paragraph:hover .lawtext-analyzed-parentheses[data-lawtext_parentheses_depth="1"]
{
    background-color: hsla(60, 100%, 50%, 0.1);
}

.lawtext-analyzed-parentheses[data-lawtext_parentheses_depth="2"]:hover,
.paragraph-item-Paragraph:hover .lawtext-analyzed-parentheses[data-lawtext_parentheses_depth="2"]
{
    background-color: hsla(30, 100%, 50%, 0.1);
}

.lawtext-analyzed-parentheses[data-lawtext_parentheses_depth="3"]:hover,
.paragraph-item-Paragraph:hover .lawtext-analyzed-parentheses[data-lawtext_parentheses_depth="3"]
{
    background-color: hsla(0, 100%, 50%, 0.1);
}

.lawtext-analyzed-parentheses[data-lawtext_parentheses_depth="4"]:hover,
.paragraph-item-Paragraph:hover .lawtext-analyzed-parentheses[data-lawtext_parentheses_depth="4"]
{
    background-color: hsl(330, 100%, 50%, 0.1);
}

.lawtext-analyzed-parentheses[data-lawtext_parentheses_depth="5"]:hover,
.paragraph-item-Paragraph:hover .lawtext-analyzed-parentheses[data-lawtext_parentheses_depth="5"]
{
    background-color: hsl(300, 100%, 50%, 0.1);
}

.lawtext-analyzed-parentheses[data-lawtext_parentheses_depth="6"]:hover,
.paragraph-item-Paragraph:hover .lawtext-analyzed-parentheses[data-lawtext_parentheses_depth="6"]
{
    background-color: hsl(270, 100%, 50%, 0.1);
}

.lawtext-analyzed-start-parenthesis,
.lawtext-analyzed-end-parenthesis
{
    border: 1px solid transparent;
    margin: -1px;
    transition: border-color 0.3s;
}

.lawtext-analyzed-parentheses:hover
    > .lawtext-analyzed-start-parenthesis,
.lawtext-analyzed-parentheses:hover
    > .lawtext-analyzed-end-parenthesis
{
    border-color: gray;
}

.lawtext-analyzed-parentheses-content[data-lawtext_parentheses_type="square"] {
    color: rgb(158, 79, 0);
}
`;

const ParenthesesSpan = styled.span`
`;

interface __ParenthesesComponentProps extends ELComponentProps { el: std.__EL }

const __ParenthesesComponent = withCatcher<__ParenthesesComponentProps>(props => {
    const el = props.el;

    const blocks: JSX.Element[] = [];

    for (const child of el.children) {

        if (typeof child === "string" || child instanceof String) {
            throw new NotImplementedError("string");

        } else if (child.tag === "__PStart") {
            blocks.push(<__PStartComponent el={child as std.__EL} key={child.id} ls={props.ls} />);

        } else if (child.tag === "__PContent") {
            blocks.push(<__PContentComponent el={child as std.__EL} key={child.id} ls={props.ls} />);

        } else if (child.tag === "__PEnd") {
            blocks.push(<__PEndComponent el={child as std.__EL} key={child.id} ls={props.ls} />);

        } else {
            throw new NotImplementedError(child.tag);

        }
    }
    return (
        <ParenthesesSpan
            className="lawtext-analyzed-parentheses"
            data-lawtext_parentheses_type={el.attr.type}
            data-lawtext_parentheses_depth={el.attr.depth}
        >
            {blocks}
        </ParenthesesSpan>
    );
});


const PStartSpan = styled.span`
`;

interface __PStartComponentProps extends ELComponentProps { el: std.__EL }

const __PStartComponent = withCatcher<__PStartComponentProps>(props => {
    const el = props.el;
    return (
        <PStartSpan
            className="lawtext-analyzed-start-parenthesis"
            data-lawtext_parentheses_type={el.attr.type}
        >
            {getInnerRun(el, props.ls)}
        </PStartSpan>
    );
});


const PContentSpan = styled.span`
`;

interface __PContentComponentProps extends ELComponentProps { el: std.__EL }

const __PContentComponent = withCatcher<__PContentComponentProps>(props => {
    const el = props.el;
    return (
        <PContentSpan
            className="lawtext-analyzed-parentheses-content"
            data-lawtext_parentheses_type={el.attr.type}
        >
            {getInnerRun(el, props.ls)}
        </PContentSpan>
    );
});


const PEndSpan = styled.span`
`;

interface __PEndComponentProps extends ELComponentProps { el: std.__EL }

const __PEndComponent = withCatcher<__PEndComponentProps>(props => {
    const el = props.el;
    return (
        <PEndSpan
            className="lawtext-analyzed-end-parenthesis"
            data-lawtext_parentheses_type={el.attr.type}
        >
            {getInnerRun(el, props.ls)}
        </PEndSpan>
    );
});


const MismatchStartParenthesisSpan = styled.span`
    color: red;
`;

interface __MismatchStartParenthesisComponentProps extends ELComponentProps { el: std.__EL }

const __MismatchStartParenthesisComponent = withCatcher<__MismatchStartParenthesisComponentProps>(props => {
    const el = props.el;
    return (
        <MismatchStartParenthesisSpan>
            {getInnerRun(el, props.ls)}
        </MismatchStartParenthesisSpan>
    );
});

const MismatchEndParenthesisSpan = styled.span`
    color: red;
`;

interface __MismatchEndParenthesisComponentProps extends ELComponentProps { el: std.__EL }

const __MismatchEndParenthesisComponent = withCatcher<__MismatchEndParenthesisComponentProps>(props => {
    const el = props.el;
    return (
        <MismatchEndParenthesisSpan>
            {getInnerRun(el, props.ls)}
        </MismatchEndParenthesisSpan>
    );
});
