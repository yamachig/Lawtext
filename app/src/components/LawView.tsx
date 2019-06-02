import * as $ from "jquery";
import * as React from "react";
import AnimateHeight from 'react-animate-height';
import EventListener from 'react-event-listener';
import styled, { createGlobalStyle } from 'styled-components';
import { isString } from "util";
import * as analyzer from "../../../core/src/analyzer";
import * as std from "../../../core/src/std_law"
import { assertNever, EL, NotImplementedError } from "../../../core/src/util"
import { LawtextAppPageActions } from "../actions/index";
import { Dispatchers } from '../containers/LawtextAppPageContainer';
import { containerInfoOf, LawtextAppPageState, RouteState } from '../states';
import { store } from "../store";


const MARGIN = "　";

type Props = LawtextAppPageState & Dispatchers & RouteState;

const em = (input) => {
    const emSize = parseFloat($("body").css("font-size"));
    return (emSize * input);
}


const LawViewDiv = styled.div`
    padding: 2rem 3rem 10rem 3rem;
`;

export class LawView extends React.Component<Props> {
    public render() {
        return (
            <LawViewDiv>
                <GlobalStyle />
                {this.props.hasError && <LawViewError {...this.props} />}
                {this.props.law && <LawComponent el={this.props.law} indent={0} />}
            </LawViewDiv>
        );
    }
}

const LawViewErrorDiv = styled.div`
`;

class LawViewError extends React.Component<Props> {
    public render() {
        return (
            <LawViewErrorDiv className="alert alert-danger">
                レンダリング時に{this.props.errors.length}個のエラーが発生しました
            </LawViewErrorDiv>
        );
    }
}



const ErrorComponentDiv = styled.div`
`;

class BaseLawComponent<P = {}, S = {}, SS = any> extends React.Component<P, S & { hasError: boolean, error: Error | null }, SS> {
    constructor(props: P, state: S) {
        super(props);
        this.state = Object.assign({}, state, { hasError: false, error: null });
    }

    public componentDidCatch(error, info) {
        this.setState(Object.assign({}, this.state, { hasError: true, error }));
        const currentState = store.getState().lawtextAppPage;
        store.dispatch(LawtextAppPageActions.modifyState({ hasError: true, errors: [...currentState.errors, error] }));
    }

    public render(): JSX.Element | JSX.Element[] | null | undefined {
        if (this.state.hasError) {
            return this.renderError();
        } else {
            return this.renderNormal();
        }
    }

    protected renderNormal(): JSX.Element | JSX.Element[] | null | undefined {
        return undefined;
    }

    protected renderError(): JSX.Element | JSX.Element[] | null | undefined {
        return (
            <ErrorComponentDiv className="alert alert-danger">
                レンダリング時にエラーが発生しました：
                {this.state.error && this.state.error.toString()}
            </ErrorComponentDiv>
        );
    }
}


interface ELComponentProps { el: EL };

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
    StyleStructComponentProps |
    FigStructComponentProps |
    FigRunComponentProps |
    AmendProvisionComponentProps |
    PreambleComponentProps |
    AppdxNoteComponentProps |
    AppdxComponentProps |
    AppdxFormatComponentProps |
    SupplNoteComponentProps |
    SupplProvisionAppdxTableComponentProps |
    SupplProvisionAppdxStyleComponentProps |
    SupplProvisionAppdxComponentProps |
    NoteStructComponentProps |
    FormatStructComponentProps |
    SentenceDummyProps
);

class AnyLawComponent extends BaseLawComponent<AnyLawComponentProps> {
    protected renderNormal() {
        if (isLawComponentProps(this.props)) { return <LawComponent {...this.props} /> }
        else if (isLawBodyComponentProps(this.props)) { return <LawBodyComponent {...this.props} /> }
        else if (isLawTitleComponentProps(this.props)) { return <LawTitleComponent {...this.props} /> }
        else if (isEnactStatementComponentProps(this.props)) { return <EnactStatementComponent {...this.props} /> }
        else if (isTOCComponentProps(this.props)) { return <TOCComponent {...this.props} /> }
        else if (isTOCItemComponentProps(this.props)) { return <TOCItemComponent {...this.props} /> }
        else if (isAppdxTableComponentProps(this.props)) { return <AppdxTableComponent {...this.props} /> }
        else if (isAppdxStyleComponentProps(this.props)) { return <AppdxStyleComponent {...this.props} /> }
        else if (isAppdxFigComponentProps(this.props)) { return <AppdxFigComponent {...this.props} /> }
        else if (isSupplProvisionComponentProps(this.props)) { return <SupplProvisionComponent {...this.props} /> }
        else if (isArticleGroupComponentProps(this.props)) { return <ArticleGroupComponent {...this.props} /> }
        else if (isArticleGroupTitleComponentProps(this.props)) { return <ArticleGroupTitleComponent {...this.props} /> }
        else if (isArticleComponentProps(this.props)) { return <ArticleComponent {...this.props} /> }
        else if (isParagraphItemComponentProps(this.props)) { return <ParagraphItemComponent {...this.props} /> }
        else if (isListComponentProps(this.props)) { return <ListComponent {...this.props} /> }
        else if (isTableStructComponentProps(this.props)) { return <TableStructComponent {...this.props} /> }
        else if (isTableComponentProps(this.props)) { return <TableComponent {...this.props} /> }
        else if (isRemarksComponentProps(this.props)) { return <RemarksComponent {...this.props} /> }
        else if (isTableRowComponentProps(this.props)) { return <TableRowComponent {...this.props} /> }
        else if (isTableColumnComponentProps(this.props)) { return <TableColumnComponent {...this.props} /> }
        else if (isStyleStructComponentProps(this.props)) { return <StyleStructComponent {...this.props} /> }
        else if (isFigStructComponentProps(this.props)) { return <FigStructComponent {...this.props} /> }
        else if (isFigRunComponentProps(this.props)) { return <FigRunComponent {...this.props} /> }
        else if (isAmendProvisionComponentProps(this.props)) { return <AmendProvisionComponent {...this.props} /> }
        else if (isPreambleComponentProps(this.props)) { return <PreambleComponent {...this.props} /> }
        else if (isAppdxNoteComponentProps(this.props)) { return <AppdxNoteComponent {...this.props} /> }
        else if (isAppdxComponentProps(this.props)) { throw new NotImplementedError("Appdx"); }
        else if (isAppdxFormatComponentProps(this.props)) { throw new NotImplementedError("AppdxFormat"); }
        else if (isSupplNoteComponentProps(this.props)) { throw new NotImplementedError("SupplNote"); }
        else if (isSupplProvisionAppdxTableComponentProps(this.props)) { return <SupplProvisionAppdxTableComponent {...this.props} /> }
        else if (isSupplProvisionAppdxStyleComponentProps(this.props)) { return <SupplProvisionAppdxStyleComponent {...this.props} /> }
        else if (isSupplProvisionAppdxComponentProps(this.props)) { throw new NotImplementedError("SupplProvisionAppdx"); }
        else if (isNoteStructComponentProps(this.props)) { return <NoteStructComponent {...this.props} /> }
        else if (isFormatStructComponentProps(this.props)) { throw new NotImplementedError("FormatStruct"); }
        else if (isSentenceDummyProps(this.props)) { return <BlockSentenceComponent els={[this.props.el]} indent={this.props.indent} /> }
        else { return assertNever(this.props); }
    }
}


interface AppdxComponentProps extends ELComponentProps { el: std.Appdx, indent: number };
const isAppdxComponentProps = (props: ELComponentProps): props is AppdxComponentProps => props.el.tag === "Appdx"

interface AppdxFormatComponentProps extends ELComponentProps { el: std.AppdxFormat, indent: number };
const isAppdxFormatComponentProps = (props: ELComponentProps): props is AppdxFormatComponentProps => props.el.tag === "AppdxFormat"

interface SupplNoteComponentProps extends ELComponentProps { el: std.SupplNote, indent: number };
const isSupplNoteComponentProps = (props: ELComponentProps): props is SupplNoteComponentProps => props.el.tag === "SupplNote"

interface SupplProvisionAppdxComponentProps extends ELComponentProps { el: std.SupplProvisionAppdx, indent: number };
const isSupplProvisionAppdxComponentProps = (props: ELComponentProps): props is SupplProvisionAppdxComponentProps => props.el.tag === "SupplProvisionAppdx"

interface FormatStructComponentProps extends ELComponentProps { el: std.FormatStruct, indent: number };
const isFormatStructComponentProps = (props: ELComponentProps): props is FormatStructComponentProps => props.el.tag === "FormatStruct"














interface LawComponentProps extends ELComponentProps { el: std.Law, indent: number };

const isLawComponentProps = (props: ELComponentProps): props is LawComponentProps => props.el.tag === "Law"

class LawComponent extends BaseLawComponent<LawComponentProps> {
    public shouldComponentUpdate(nextProps: LawComponentProps) {
        return this.props.el !== nextProps.el;
    }
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;
        let LawNum = "";
        let LawBody: std.LawBody | undefined;
        for (const child of el.children) {
            if (child.tag === "LawNum") {
                LawNum = child.text;
            } else if (child.tag === "LawBody") {
                LawBody = child;
            } else {
                assertNever(child);
            }
        }

        return LawBody && <LawBodyComponent el={LawBody} indent={indent} LawNum={LawNum} />;
    }
}



interface LawBodyComponentProps extends ELComponentProps { el: std.LawBody, indent: number, LawNum: string };

const isLawBodyComponentProps = (props: ELComponentProps): props is LawBodyComponentProps => props.el.tag === "LawBody"

class LawBodyComponent extends BaseLawComponent<LawBodyComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;
        const LawNum = this.props.LawNum;

        const blocks: JSX.Element[] = [];
        for (const child of el.children) {

            if (child.tag === "LawTitle") {
                blocks.push(<LawTitleComponent el={child} indent={indent} LawNum={LawNum} key={child.id} />);

            } else if (child.tag === "TOC") {
                blocks.push(<TOCComponent el={child} indent={indent} key={child.id} />);

            } else if (child.tag === "MainProvision") {
                blocks.push(<ArticleGroupComponent el={child} indent={indent} key={child.id} />);

            } else if (child.tag === "SupplProvision") {
                blocks.push(<SupplProvisionComponent el={child} indent={indent} key={child.id} />);

            } else if (child.tag === "AppdxTable") {
                blocks.push(<AppdxTableComponent el={child} indent={indent} key={child.id} />);

            } else if (child.tag === "AppdxStyle") {
                blocks.push(<AppdxStyleComponent el={child} indent={indent} key={child.id} />);

            } else if (child.tag === "AppdxFig") {
                blocks.push(<AppdxFigComponent el={child} indent={indent} key={child.id} />);

            } else if (child.tag === "AppdxNote") {
                blocks.push(<AppdxNoteComponent el={child} indent={indent} key={child.id} />);

            } else if (child.tag === "EnactStatement") {
                blocks.push(<EnactStatementComponent el={child} indent={indent} key={child.id} />);

            } else if (child.tag === "Preamble") {
                blocks.push(<PreambleComponent el={child} indent={indent} key={child.id} />);

            }
            else if (child.tag === "Appdx") { throw new NotImplementedError(child.tag); }
            else if (child.tag === "AppdxFormat") { throw new NotImplementedError(child.tag); }
            else { assertNever(child); }
        }
        return blocks;
    }
}


const LawTitleDiv = styled.div`
    font-weight: bold;
`;

const LawNumDiv = styled.div`
    font-weight: bold;
`;

interface LawTitleComponentProps extends ELComponentProps { el: std.LawTitle, indent: number, LawNum: string };

const isLawTitleComponentProps = (props: ELComponentProps): props is LawTitleComponentProps => props.el.tag === "LawTitle"

class LawTitleComponent extends BaseLawComponent<LawTitleComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;
        const LawNum = this.props.LawNum;

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
        )
    }
}



const PreambleDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

interface PreambleComponentProps extends ELComponentProps { el: std.Preamble, indent: number };

const isPreambleComponentProps = (props: ELComponentProps): props is PreambleComponentProps => props.el.tag === "Preamble"

class PreambleComponent extends BaseLawComponent<PreambleComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;
        const blocks: JSX.Element[] = [];

        for (const paragraph of el.children) {
            blocks.push(<ParagraphItemComponent el={paragraph} indent={indent} key={paragraph.id} />);
        }

        return (
            <PreambleDiv
                className="law-anchor"
                data-el_id={el.id.toString()}
            >
                {blocks}
            </PreambleDiv>
        );
    }
}



const EnactStatementDiv = styled.div`
    clear: both;
    padding-top: 1em;
    text-indent: 1em;
`;

interface EnactStatementComponentProps extends ELComponentProps { el: std.EnactStatement, indent: number };

const isEnactStatementComponentProps = (props: ELComponentProps): props is EnactStatementComponentProps => props.el.tag === "EnactStatement"

class EnactStatementComponent extends BaseLawComponent<EnactStatementComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        return (
            <EnactStatementDiv>
                {el.text}
            </EnactStatementDiv>
        );
    }
}



const TOCDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

interface TOCComponentProps extends ELComponentProps { el: std.TOC, indent: number };

const isTOCComponentProps = (props: ELComponentProps): props is TOCComponentProps => props.el.tag === "TOC"

class TOCComponent extends BaseLawComponent<TOCComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        const blocks: JSX.Element[] = [];
        let tocLabelText: string = "";
        for (const child of el.children) {

            if (child.tag === "TOCLabel") {

                tocLabelText = child.text;
                blocks.push(
                    <div
                        className="law-anchor"
                        data-el_id={el.id.toString()}
                        style={{ marginLeft: `${indent}em` }}
                        key={child.id}
                    >
                        {child.text}
                    </div>
                );

            } else if (child.tag === "TOCPart" || child.tag === "TOCChapter" || child.tag === "TOCSection" || child.tag === "TOCSupplProvision" || child.tag === "TOCArticle" || child.tag === "TOCAppdxTableLabel") {
                blocks.push(<TOCItemComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            }
            else if (child.tag === "TOCPreambleLabel") { throw new NotImplementedError(child.tag); }
            else { assertNever(child); }
        }

        return (
            <TOCDiv
                data-toplevel_container_info={JSON.stringify(containerInfoOf(el))}
            >
                {blocks}
            </TOCDiv>
        );
    }
}



interface TOCItemComponentProps extends ELComponentProps { el: std.TOCPart | std.TOCChapter | std.TOCSection | std.TOCSubsection | std.TOCDivision | std.TOCSupplProvision | std.TOCArticle | std.TOCAppdxTableLabel, indent: number };

const isTOCItemComponentProps = (props: ELComponentProps): props is TOCItemComponentProps => {
    return props.el.tag === "TOCPart" || props.el.tag === "TOCPart" || props.el.tag === "TOCChapter" || props.el.tag === "TOCSection" || props.el.tag === "TOCSubsection" || props.el.tag === "TOCDivision" || props.el.tag === "TOCSupplProvision" || props.el.tag === "TOCArticle" || props.el.tag === "TOCAppdxTableLabel";
}

class TOCItemComponent extends BaseLawComponent<TOCItemComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

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
                        {ArticleTitle && <RunComponent els={ArticleTitle.children} />}
                        {ArticleCaption && <RunComponent els={ArticleCaption.children} />}
                    </div>
                );
            }

        } else if (el.tag === "TOCAppdxTableLabel") {
            throw new NotImplementedError(el.tag);

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
                        {TocItemTitle && <RunComponent els={TocItemTitle.children} />}
                        {ArticleRange && <RunComponent els={ArticleRange.children} />}
                    </div>
                );
            }
            for (const TOCItem of TOCItems) {
                blocks.push(<TOCItemComponent el={TOCItem} indent={indent + 1} key={TOCItem.id} />); /* >>>> INDENT >>>> */
            }

        }
        return blocks;
    }
}


const AppdxTableDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

const AppdxTableTitleDiv = styled.div`
    font-weight: bold;
`;

interface AppdxTableComponentProps extends ELComponentProps { el: std.AppdxTable, indent: number };

const isAppdxTableComponentProps = (props: ELComponentProps): props is AppdxTableComponentProps => props.el.tag === "AppdxTable"

class AppdxTableComponent extends BaseLawComponent<AppdxTableComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        const blocks: JSX.Element[] = [];

        let AppdxTableTitle: std.AppdxTableTitle | null = null;
        let RelatedArticleNum: std.RelatedArticleNum | null = null;
        const ChildItems: Array<std.TableStruct | std.Item | std.Remarks> = [];
        for (const child of el.children) {

            if (child.tag === "AppdxTableTitle") {
                AppdxTableTitle = child;

            } else if (child.tag === "RelatedArticleNum") {
                RelatedArticleNum = child;

            } else {
                ChildItems.push(child);
            }
        }

        if (AppdxTableTitle || RelatedArticleNum) {
            blocks.push(
                <AppdxTableTitleDiv
                    className="law-anchor"
                    data-el_id={el.id.toString()}
                    key={(AppdxTableTitle || RelatedArticleNum || { id: 0 }).id}
                >
                    {AppdxTableTitle && <RunComponent els={AppdxTableTitle.children} />}
                    {RelatedArticleNum && <RunComponent els={RelatedArticleNum.children} />}
                </AppdxTableTitleDiv>
            );
        }

        for (const child of ChildItems) {
            if (child.tag === "TableStruct") {
                blocks.push(<TableStructComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "Item") {
                blocks.push(<ParagraphItemComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "Remarks") {
                blocks.push(<RemarksComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

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
    }
}




const AppdxStyleDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

const AppdxStyleTitleDiv = styled.div`
    font-weight: bold;
`;

interface AppdxStyleComponentProps extends ELComponentProps { el: std.AppdxStyle, indent: number };

const isAppdxStyleComponentProps = (props: ELComponentProps): props is AppdxStyleComponentProps => props.el.tag === "AppdxStyle"

class AppdxStyleComponent extends BaseLawComponent<AppdxStyleComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        const blocks: JSX.Element[] = [];

        let AppdxStyleTitle: std.AppdxStyleTitle | null = null;
        let RelatedArticleNum: std.RelatedArticleNum | null = null;
        const ChildItems: Array<std.StyleStruct | std.Item | std.Remarks> = [];
        for (const child of el.children) {

            if (child.tag === "AppdxStyleTitle") {
                AppdxStyleTitle = child;

            } else if (child.tag === "RelatedArticleNum") {
                RelatedArticleNum = child;

            } else {
                ChildItems.push(child);
            }
        }

        if (AppdxStyleTitle || RelatedArticleNum) {
            blocks.push(
                <AppdxStyleTitleDiv
                    className="law-anchor"
                    data-el_id={el.id.toString()}
                    key={(AppdxStyleTitle || RelatedArticleNum || { id: 0 }).id}
                >
                    {AppdxStyleTitle && <RunComponent els={AppdxStyleTitle.children} />}
                    {RelatedArticleNum && <RunComponent els={RelatedArticleNum.children} />}
                </AppdxStyleTitleDiv>
            );
        }

        for (const child of ChildItems) {
            if (child.tag === "StyleStruct") {
                blocks.push(<StyleStructComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "Item") {
                blocks.push(<ParagraphItemComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "Remarks") {
                blocks.push(<RemarksComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

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
    }
}


const AppdxFigDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

const AppdxFigTitleDiv = styled.div`
    font-weight: bold;
`;

interface AppdxFigComponentProps extends ELComponentProps { el: std.AppdxFig, indent: number };

const isAppdxFigComponentProps = (props: ELComponentProps): props is AppdxFigComponentProps => props.el.tag === "AppdxFig"

class AppdxFigComponent extends BaseLawComponent<AppdxFigComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        const blocks: JSX.Element[] = [];

        let AppdxFigTitle: std.AppdxFigTitle | null = null;
        let RelatedArticleNum: std.RelatedArticleNum | null = null;
        const ChildItems: Array<std.TableStruct | std.FigStruct> = [];
        for (const child of el.children) {

            if (child.tag === "AppdxFigTitle") {
                AppdxFigTitle = child;

            } else if (child.tag === "RelatedArticleNum") {
                RelatedArticleNum = child;

            } else {
                ChildItems.push(child);
            }
        }

        if (AppdxFigTitle || RelatedArticleNum) {
            blocks.push(
                <AppdxFigTitleDiv
                    className="law-anchor"
                    data-el_id={el.id.toString()}
                    key={(AppdxFigTitle || RelatedArticleNum || { id: 0 }).id}
                >
                    {AppdxFigTitle && <RunComponent els={AppdxFigTitle.children} />}
                    {RelatedArticleNum && <RunComponent els={RelatedArticleNum.children} />}
                </AppdxFigTitleDiv>
            );
        }

        for (const child of ChildItems) {
            if (child.tag === "TableStruct") {
                blocks.push(<TableStructComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "FigStruct") {
                blocks.push(<FigStructComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

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
    }
}


const AppdxNoteDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

const AppdxNoteTitleDiv = styled.div`
    font-weight: bold;
`;

interface AppdxNoteComponentProps extends ELComponentProps { el: std.AppdxNote, indent: number };

const isAppdxNoteComponentProps = (props: ELComponentProps): props is AppdxNoteComponentProps => props.el.tag === "AppdxNote"

class AppdxNoteComponent extends BaseLawComponent<AppdxNoteComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        const blocks: JSX.Element[] = [];

        let AppdxNoteTitle: std.AppdxNoteTitle | null = null;
        let RelatedArticleNum: std.RelatedArticleNum | null = null;
        const ChildItems: Array<std.TableStruct | std.FigStruct | std.Remarks | std.NoteStruct> = [];
        for (const child of el.children) {

            if (child.tag === "AppdxNoteTitle") {
                AppdxNoteTitle = child;

            } else if (child.tag === "RelatedArticleNum") {
                RelatedArticleNum = child;

            } else {
                ChildItems.push(child);
            }
        }

        if (AppdxNoteTitle || RelatedArticleNum) {
            blocks.push(
                <AppdxNoteTitleDiv
                    className="law-anchor"
                    data-el_id={el.id.toString()}
                    key={(AppdxNoteTitle || RelatedArticleNum || { id: 0 }).id}
                >
                    {AppdxNoteTitle && <RunComponent els={AppdxNoteTitle.children} />}
                    {RelatedArticleNum && <RunComponent els={RelatedArticleNum.children} />}
                </AppdxNoteTitleDiv>
            );
        }

        for (const child of ChildItems) {
            if (child.tag === "TableStruct") {
                blocks.push(<TableStructComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "FigStruct") {
                blocks.push(<FigStructComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "Remarks") {
                blocks.push(<RemarksComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "NoteStruct") {
                blocks.push(<NoteStructComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

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
    }
}


const SupplProvisionAppdxTableDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

const SupplProvisionAppdxTableTitleDiv = styled.div`
    font-weight: bold;
`;

interface SupplProvisionAppdxTableComponentProps extends ELComponentProps { el: std.SupplProvisionAppdxTable, indent: number };

const isSupplProvisionAppdxTableComponentProps = (props: ELComponentProps): props is SupplProvisionAppdxTableComponentProps => props.el.tag === "SupplProvisionAppdxTable"

class SupplProvisionAppdxTableComponent extends BaseLawComponent<SupplProvisionAppdxTableComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        const blocks: JSX.Element[] = [];

        let SupplProvisionAppdxTableTitle: std.SupplProvisionAppdxTableTitle | null = null;
        let RelatedArticleNum: std.RelatedArticleNum | null = null;
        const ChildItems: Array<std.TableStruct | std.Item | std.Remarks> = [];
        for (const child of el.children) {

            if (child.tag === "SupplProvisionAppdxTableTitle") {
                SupplProvisionAppdxTableTitle = child;

            } else if (child.tag === "RelatedArticleNum") {
                RelatedArticleNum = child;

            } else {
                ChildItems.push(child);
            }
        }

        if (SupplProvisionAppdxTableTitle || RelatedArticleNum) {
            blocks.push(
                <SupplProvisionAppdxTableTitleDiv
                    className="law-anchor"
                    data-el_id={el.id.toString()}
                    key={(SupplProvisionAppdxTableTitle || RelatedArticleNum || { id: 0 }).id}
                >
                    {SupplProvisionAppdxTableTitle && <RunComponent els={SupplProvisionAppdxTableTitle.children} />}
                    {RelatedArticleNum && <RunComponent els={RelatedArticleNum.children} />}
                </SupplProvisionAppdxTableTitleDiv>
            );
        }

        for (const child of ChildItems) {
            if (child.tag === "TableStruct") {
                blocks.push(<TableStructComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "Item") {
                blocks.push(<ParagraphItemComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "Remarks") {
                blocks.push(<RemarksComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            }
            else { assertNever(child); }
        }

        return (
            <SupplProvisionAppdxTableDiv>
                {blocks}
            </SupplProvisionAppdxTableDiv>
        );
    }
}




const SupplProvisionAppdxStyleDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

const SupplProvisionAppdxStyleTitleDiv = styled.div`
    font-weight: bold;
`;

interface SupplProvisionAppdxStyleComponentProps extends ELComponentProps { el: std.SupplProvisionAppdxStyle, indent: number };

const isSupplProvisionAppdxStyleComponentProps = (props: ELComponentProps): props is SupplProvisionAppdxStyleComponentProps => props.el.tag === "SupplProvisionAppdxStyle"

class SupplProvisionAppdxStyleComponent extends BaseLawComponent<SupplProvisionAppdxStyleComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        const blocks: JSX.Element[] = [];

        let SupplProvisionAppdxStyleTitle: std.SupplProvisionAppdxStyleTitle | null = null;
        let RelatedArticleNum: std.RelatedArticleNum | null = null;
        const ChildItems: Array<std.StyleStruct | std.Item | std.Remarks> = [];
        for (const child of el.children) {

            if (child.tag === "SupplProvisionAppdxStyleTitle") {
                SupplProvisionAppdxStyleTitle = child;

            } else if (child.tag === "RelatedArticleNum") {
                RelatedArticleNum = child;

            } else {
                ChildItems.push(child);
            }
        }

        if (SupplProvisionAppdxStyleTitle || RelatedArticleNum) {
            blocks.push(
                <SupplProvisionAppdxStyleTitleDiv
                    className="law-anchor"
                    data-el_id={el.id.toString()}
                    key={(SupplProvisionAppdxStyleTitle || RelatedArticleNum || { id: 0 }).id}
                >
                    {SupplProvisionAppdxStyleTitle && <RunComponent els={SupplProvisionAppdxStyleTitle.children} />}
                    {RelatedArticleNum && <RunComponent els={RelatedArticleNum.children} />}
                </SupplProvisionAppdxStyleTitleDiv>
            );
        }

        for (const child of ChildItems) {
            if (child.tag === "StyleStruct") {
                blocks.push(<StyleStructComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "Item") {
                blocks.push(<ParagraphItemComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "Remarks") {
                blocks.push(<RemarksComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            }
            else { assertNever(child); }
        }

        return (
            <SupplProvisionAppdxStyleDiv>
                {blocks}
            </SupplProvisionAppdxStyleDiv>
        );
    }
}



interface SupplProvisionComponentProps extends ELComponentProps { el: std.SupplProvision, indent: number };

const isSupplProvisionComponentProps = (props: ELComponentProps): props is SupplProvisionComponentProps => props.el.tag === "SupplProvision"

class SupplProvisionComponent extends BaseLawComponent<SupplProvisionComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        const blocks: JSX.Element[] = [];

        let SupplProvisionLabel: std.SupplProvisionLabel | null = null;
        const ChildItems: Array<std.Chapter | std.Article | std.Paragraph | std.SupplProvisionAppdxTable | std.SupplProvisionAppdxStyle | std.SupplProvisionAppdx> = [];
        for (const child of el.children) {

            if (child.tag === "SupplProvisionLabel") {
                SupplProvisionLabel = child;

            } else {
                ChildItems.push(child);
            }
        }

        if (SupplProvisionLabel) {
            const Extract = el.attr.Extract === "true" ? `${MARGIN}抄` : "";
            const AmendLawNum = el.attr.AmendLawNum ? `（${el.attr.AmendLawNum}）` : "";
            blocks.push(
                <ArticleGroupTitleDiv
                    style={{ marginLeft: `${indent + 3}em` }}
                    key={SupplProvisionLabel.id}
                >
                    <RunComponent els={SupplProvisionLabel.children} />{AmendLawNum}{Extract}
                </ArticleGroupTitleDiv>
            );
        }

        for (const child of ChildItems) {
            if (child.tag === "Article") {
                blocks.push(<ArticleComponent el={child} indent={indent} key={child.id} />);

            } else if (child.tag === "Paragraph") {
                blocks.push(<ParagraphItemComponent el={child} indent={indent} key={child.id} />);

            } else if (child.tag === "Chapter") {
                blocks.push(<ArticleGroupComponent el={child} indent={indent} key={child.id} />);

            } else if (child.tag === "SupplProvisionAppdxTable") {
                blocks.push(<SupplProvisionAppdxTableComponent el={child} indent={indent} key={child.id} />);

            } else if (child.tag === "SupplProvisionAppdxStyle") {
                blocks.push(<SupplProvisionAppdxStyleComponent el={child} indent={indent} key={child.id} />);

            } else if (child.tag === "SupplProvisionAppdx") {
                throw new NotImplementedError(child.tag);

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
    }
}

interface ArticleGroupComponentProps extends ELComponentProps { el: std.MainProvision | std.Part | std.Chapter | std.Section | std.Subsection | std.Division, indent: number };

const isArticleGroupComponentProps = (props: ELComponentProps): props is ArticleGroupComponentProps => props.el.tag === "MainProvision" || props.el.tag === "Part" || props.el.tag === "Chapter" || props.el.tag === "Section" || props.el.tag === "Subsection" || props.el.tag === "Division"

class ArticleGroupComponent extends BaseLawComponent<ArticleGroupComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

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
            blocks.push(<ArticleGroupTitleComponent el={ArticleGroupTitle} indent={indent} key={ArticleGroupTitle.id} />);
        }

        for (const child of ChildItems) {
            if (child.tag === "Article") {
                blocks.push(<ArticleComponent el={child} indent={indent} key={child.id} />);

            } else if (child.tag === "Paragraph") {
                blocks.push(<ParagraphItemComponent el={child} indent={indent} key={child.id} />);

            } else {
                blocks.push(<ArticleGroupComponent el={child} indent={indent} key={child.id} />);
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
    }
}



const ArticleGroupTitleDiv = styled.div`
    clear: both;
    font-weight: bold;
    padding-top: 1em;
`;

interface ArticleGroupTitleComponentProps extends ELComponentProps { el: std.PartTitle | std.ChapterTitle | std.SectionTitle | std.SubsectionTitle | std.DivisionTitle, indent: number };

const isArticleGroupTitleComponentProps = (props: ELComponentProps): props is ArticleGroupTitleComponentProps => props.el.tag === "PartTitle" || props.el.tag === "ChapterTitle" || props.el.tag === "SectionTitle" || props.el.tag === "SubsectionTitle" || props.el.tag === "DivisionTitle"

class ArticleGroupTitleComponent extends BaseLawComponent<ArticleGroupTitleComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

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
                <RunComponent els={el.children} />
            </ArticleGroupTitleDiv>
        );
    }
}



const ArticleDiv = styled.div`
    clear: both;
    padding-top: 1em;
`;

const ArticleCaptionDiv = styled.div`
    padding-left: 1em;
    text-indent: -1em;
`;

interface ArticleComponentProps extends ELComponentProps { el: std.Article, indent: number };

const isArticleComponentProps = (props: ELComponentProps): props is ArticleComponentProps => props.el.tag === "Article"

class ArticleComponent extends BaseLawComponent<ArticleComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        const blocks: JSX.Element[] = [];

        let ArticleCaption: std.ArticleCaption | null = null;
        let ArticleTitle: std.ArticleTitle | null = null;
        const Paragraphs: std.Paragraph[] = [];
        for (const child of el.children) {

            if (child.tag === "ArticleCaption") {
                ArticleCaption = child;

            } else if (child.tag === "ArticleTitle") {
                ArticleTitle = child;

            } else if (child.tag === "Paragraph") {
                Paragraphs.push(child);

            } else if (child.tag === "SupplNote") {
                throw new NotImplementedError(child.tag);

            }
            else { assertNever(child); }
        }

        if (ArticleCaption) {
            blocks.push(
                <ArticleCaptionDiv
                    style={{ marginLeft: `${indent + 1}em` }}
                    key={ArticleCaption.id}
                >
                    <RunComponent els={ArticleCaption.children} />
                </ArticleCaptionDiv>
            );
        }

        for (let i = 0; i < Paragraphs.length; i++) {
            const Paragraph = Paragraphs[i];
            blocks.push(
                <ParagraphItemComponent
                    el={Paragraph}
                    indent={indent}
                    ArticleTitle={(i === 0 && ArticleTitle) ? ArticleTitle : undefined}
                    key={Paragraph.id}
                />
            );
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
    }
}




const ParagraphCaptionDiv = styled.div`
    padding-left: 1em;
    text-indent: -1em;
`;

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

interface ParagraphItemComponentProps extends ELComponentProps { el: std.Paragraph | std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10, indent: number, ArticleTitle?: std.ArticleTitle };

const isParagraphItemComponentProps = (props: ELComponentProps): props is ParagraphItemComponentProps => props.el.tag === "Paragraph" || props.el.tag === "Item" || props.el.tag === "Subitem1" || props.el.tag === "Subitem2" || props.el.tag === "Subitem3" || props.el.tag === "Subitem4" || props.el.tag === "Subitem5" || props.el.tag === "Subitem6" || props.el.tag === "Subitem7" || props.el.tag === "Subitem8" || props.el.tag === "Subitem9" || props.el.tag === "Subitem10"

class ParagraphItemComponent extends BaseLawComponent<ParagraphItemComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;
        const ArticleTitle = this.props.ArticleTitle;

        const blocks: JSX.Element[] = [];

        let ParagraphCaption: std.ParagraphCaption | null = null;
        let ParagraphItemTitle: std.ParagraphNum | std.ItemTitle | std.Subitem1Title | std.Subitem2Title | std.Subitem3Title | std.Subitem4Title | std.Subitem5Title | std.Subitem6Title | std.Subitem7Title | std.Subitem8Title | std.Subitem9Title | std.Subitem10Title | null = null;
        let ParagraphItemSentence: std.ParagraphSentence | std.ItemSentence | std.Subitem1Sentence | std.Subitem2Sentence | std.Subitem3Sentence | std.Subitem4Sentence | std.Subitem5Sentence | std.Subitem6Sentence | std.Subitem7Sentence | std.Subitem8Sentence | std.Subitem9Sentence | std.Subitem10Sentence | undefined;
        const Children: Array<std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10 | std.AmendProvision | std.Class | std.TableStruct | std.FigStruct | std.StyleStruct | std.List> = [];
        for (const child of el.children) {

            if (child.tag === "ParagraphCaption") {
                ParagraphCaption = child;

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

            } else if (child.tag === "Item" || child.tag === "Subitem1" || child.tag === "Subitem2" || child.tag === "Subitem3" || child.tag === "Subitem4" || child.tag === "Subitem5" || child.tag === "Subitem6" || child.tag === "Subitem7" || child.tag === "Subitem8" || child.tag === "Subitem9" || child.tag === "Subitem10" || child.tag === "AmendProvision" || child.tag === "Class" || child.tag === "TableStruct" || child.tag === "FigStruct" || child.tag === "StyleStruct" || child.tag === "List") {
                Children.push(child);

            }
            else { assertNever(child); }
        }

        if (ParagraphCaption) {
            blocks.push(
                <ParagraphCaptionDiv style={{ marginLeft: `${indent + 1}em` }} key={ParagraphCaption.id}>
                    <RunComponent els={ParagraphCaption.children} />
                </ParagraphCaptionDiv>
            );
        }

        const Title = (
            <span style={{ fontWeight: "bold" }}>
                {ParagraphItemTitle && <RunComponent els={ParagraphItemTitle.children} />}
                {ArticleTitle && <RunComponent els={ArticleTitle.children} />}
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
            />
        );

        for (const child of Children) {
            if (child.tag === "Item" || child.tag === "Subitem1" || child.tag === "Subitem2" || child.tag === "Subitem3" || child.tag === "Subitem4" || child.tag === "Subitem5" || child.tag === "Subitem6" || child.tag === "Subitem7" || child.tag === "Subitem8" || child.tag === "Subitem9" || child.tag === "Subitem10") {
                blocks.push(<ParagraphItemComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "TableStruct") {
                blocks.push(<TableStructComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "FigStruct") {
                blocks.push(<FigStructComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "StyleStruct") {
                blocks.push(<StyleStructComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "List") {
                blocks.push(<ListComponent el={child} indent={indent + 2} key={child.id} />); /* >>>> INDENT ++++ INDENT >>>> */

            } else if (child.tag === "AmendProvision") {
                blocks.push(<AmendProvisionComponent el={child} indent={indent} key={child.id} />);

            } else if (child.tag === "Class") {
                throw new NotImplementedError(child.tag);

            }
            else { assertNever(child); }
        }

        if (el.tag === "Paragraph") {
            if (ArticleTitle) {
                return <ParagraphDiv>{blocks}</ParagraphDiv>;
            } else {
                return (
                    <ParagraphDiv
                        data-container_info={JSON.stringify(containerInfoOf(el))}
                    >
                        {blocks}
                    </ParagraphDiv>
                );
            }
        } else {
            return <ItemDiv>{blocks}</ItemDiv>;
        }
    }
}

interface ListComponentProps extends ELComponentProps { el: std.List | std.Sublist1 | std.Sublist2 | std.Sublist3, indent: number };

const isListComponentProps = (props: ELComponentProps): props is ListComponentProps => props.el.tag === "List" || props.el.tag === "Sublist1" || props.el.tag === "Sublist2" || props.el.tag === "Sublist3"

class ListComponent extends BaseLawComponent<ListComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        const blocks: JSX.Element[] = [];

        for (const child of el.children) {

            if (child.tag === "ListSentence" || child.tag === "Sublist1Sentence" || child.tag === "Sublist2Sentence" || child.tag === "Sublist3Sentence") {
                blocks.push(<BlockSentenceComponent els={child.children} indent={indent} key={child.id} />);

            } else if (child.tag === "Sublist1" || child.tag === "Sublist2" || child.tag === "Sublist3") {
                blocks.push(<ListComponent el={child} indent={indent + 2} key={child.id} />); /* >>>> INDENT ++++ INDENT >>>> */

            }
            else { assertNever(child); }
        }

        return (
            <div>
                {blocks}
            </div>
        );
    }
}


interface TableStructComponentProps extends ELComponentProps { el: std.TableStruct, indent: number };

const isTableStructComponentProps = (props: ELComponentProps): props is TableStructComponentProps => props.el.tag === "TableStruct"

class TableStructComponent extends BaseLawComponent<TableStructComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        const blocks: JSX.Element[] = [];

        for (const child of el.children) {

            if (child.tag === "TableStructTitle") {
                blocks.push(
                    <div key={child.id}>
                        <RunComponent els={child.children} />
                    </div>
                );

            } else if (child.tag === "Table") {
                blocks.push(<TableComponent el={child} indent={indent} key={child.id} />);

            } else if (child.tag === "Remarks") {
                blocks.push(<RemarksComponent el={child} indent={indent} key={child.id} />);

            }
            else { assertNever(child); }
        }

        return (
            <div>
                {blocks}
            </div>
        );
    }
}


const Table = styled.table`
    border-collapse: collapse;
    text-indent: 0;
    table-layout: fixed;
    width: 100%;
`;

interface TableComponentProps extends ELComponentProps { el: std.Table, indent: number };

const isTableComponentProps = (props: ELComponentProps): props is TableComponentProps => props.el.tag === "Table"

class TableComponent extends BaseLawComponent<TableComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        const rows: JSX.Element[] = [];

        for (const child of el.children) {

            if (child.tag === "TableRow" || child.tag === "TableHeaderRow") {
                rows.push(<TableRowComponent el={child} indent={indent} key={child.id} />);

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
    }
}


interface RemarksComponentProps extends ELComponentProps { el: std.Remarks, indent: number };

const isRemarksComponentProps = (props: ELComponentProps): props is RemarksComponentProps => props.el.tag === "Remarks"

class RemarksComponent extends BaseLawComponent<RemarksComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        const blocks: JSX.Element[] = [];

        let RemarksLabel: std.RemarksLabel | null = null;
        const ChildItems: Array<std.Item | std.Sentence> = [];
        for (const child of el.children) {

            if (child.tag === "RemarksLabel") {
                RemarksLabel = child;

            } else {
                ChildItems.push(child);
            }
        }

        for (let i = 0; i < ChildItems.length; i++) {
            const child = ChildItems[i];

            if (child.tag === "Sentence") {
                blocks.push(
                    <BlockSentenceComponent
                        els={[child]}
                        Title={(i === 0 && RemarksLabel && <RunComponent els={RemarksLabel.children} style={{ fontWeight: "bold" }} />) || undefined}
                        indent={0}
                        key={child.id}
                    />
                );

            } else if (child.tag === "Item") {
                if (i === 0 && RemarksLabel) {
                    blocks.push(
                        <div key={RemarksLabel.id}>
                            <RunComponent els={RemarksLabel.children} style={{ fontWeight: "bold" }} />
                        </div>
                    );
                }
                blocks.push(<ParagraphItemComponent el={child} indent={1} key={child.id} />);

            }
            else { assertNever(child); }
        }

        return (
            <div style={{ marginLeft: `${indent}em` }}>
                {blocks}
            </div>
        );
    }
}

interface TableRowComponentProps extends ELComponentProps { el: std.TableRow | std.TableHeaderRow, indent: number };

const isTableRowComponentProps = (props: ELComponentProps): props is TableRowComponentProps => props.el.tag === "TableRow" || props.el.tag === "TableHeaderRow"

class TableRowComponent extends BaseLawComponent<TableRowComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        const columns: JSX.Element[] = [];

        for (const child of el.children) {

            if (child.tag === "TableColumn" || child.tag === "TableHeaderColumn") {
                columns.push(<TableColumnComponent el={child} indent={1} key={child.id} />);

            }
            else { assertNever(child); }
        }

        return (
            <tr>
                {columns}
            </tr>
        );
    }
}


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

interface TableColumnComponentProps extends ELComponentProps { el: std.TableColumn | std.TableHeaderColumn, indent: number };

const isTableColumnComponentProps = (props: ELComponentProps): props is TableColumnComponentProps => props.el.tag === "TableColumn" || props.el.tag === "TableHeaderColumn"

class TableColumnComponent extends BaseLawComponent<TableColumnComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        const blocks: JSX.Element[] = [];

        if (el.tag === "TableHeaderColumn") {
            blocks.push(
                <div key={el.id}>
                    <RunComponent els={el.children} />
                </div>
            );

        } else if (el.tag === "TableColumn") {
            for (const child of el.children) {

                if (child.tag === "Sentence" || child.tag === "Column") {
                    blocks.push(<BlockSentenceComponent els={[child]} indent={0} key={child.id} />);

                } else if (child.tag === "FigStruct") {
                    blocks.push(<FigStructComponent el={child} indent={0} key={child.id} />);

                } else if (child.tag === "Remarks") {
                    blocks.push(<RemarksComponent el={child} indent={0} key={child.id} />);

                } else if (child.tag === "Part" || child.tag === "Chapter" || child.tag === "Section" || child.tag === "Subsection" || child.tag === "Division") {
                    blocks.push(<ArticleGroupComponent el={child} indent={0} key={child.id} />);

                } else if (child.tag === "Article") {
                    blocks.push(<ArticleComponent el={child} indent={0} key={child.id} />);

                } else if (child.tag === "Paragraph" || child.tag === "Item" || child.tag === "Subitem1" || child.tag === "Subitem2" || child.tag === "Subitem3" || child.tag === "Subitem4" || child.tag === "Subitem5" || child.tag === "Subitem6" || child.tag === "Subitem7" || child.tag === "Subitem8" || child.tag === "Subitem9" || child.tag === "Subitem10") {
                    blocks.push(<ParagraphItemComponent el={child} indent={0} key={child.id} />);
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
    }
}



interface StyleStructComponentProps extends ELComponentProps { el: std.StyleStruct, indent: number };

const isStyleStructComponentProps = (props: ELComponentProps): props is StyleStructComponentProps => props.el.tag === "StyleStruct"

class StyleStructComponent extends BaseLawComponent<StyleStructComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        const blocks: JSX.Element[] = [];

        for (const child of el.children) {

            if (child.tag === "StyleStructTitle") {
                blocks.push(
                    <div key={child.id}>
                        <RunComponent els={child.children} />
                    </div>
                );

            } else if (child.tag === "Style") {

                for (const subchild of child.children) {
                    if (isString(subchild)) {
                        throw new NotImplementedError("string");

                    } else if (std.isTable(subchild)) {
                        blocks.push(<TableComponent el={subchild} indent={indent} key={subchild.id} />);

                    } else if (std.isFig(subchild)) {
                        blocks.push(
                            <div key={subchild.id}>
                                <FigRunComponent el={subchild} />
                            </div>
                        );

                    } else if (std.isList(subchild)) {
                        blocks.push(<ListComponent el={subchild} indent={indent + 2} key={subchild.id} />); /* >>>> INDENT ++++ INDENT >>>> */

                    } else {
                        throw new NotImplementedError(subchild.tag);

                    }
                }

            } else if (child.tag === "Remarks") {
                blocks.push(<RemarksComponent el={child} indent={indent} key={child.id} />);

            }
            else { assertNever(child); }
        }

        return (
            <div>
                {blocks}
            </div>
        );
    }
}



interface NoteStructComponentProps extends ELComponentProps { el: std.NoteStruct, indent: number };

const isNoteStructComponentProps = (props: ELComponentProps): props is NoteStructComponentProps => props.el.tag === "NoteStruct"

class NoteStructComponent extends BaseLawComponent<NoteStructComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        const blocks: JSX.Element[] = [];

        for (const child of el.children) {

            if (child.tag === "NoteStructTitle") {
                blocks.push(
                    <div key={child.id}>
                        <RunComponent els={child.children} />
                    </div>
                );

            } else if (child.tag === "Note") {

                for (const subchild of child.children) {
                    if (isString(subchild)) {
                        throw new NotImplementedError("string");

                    } else if (std.isTable(subchild)) {
                        blocks.push(<TableComponent el={subchild} indent={indent} key={subchild.id} />);

                    } else if (std.isFig(subchild)) {
                        blocks.push(
                            <div key={subchild.id}>
                                <FigRunComponent el={subchild} />
                            </div>
                        );

                    } else if (std.isList(subchild)) {
                        blocks.push(<ListComponent el={subchild} indent={indent + 2} key={subchild.id} />); /* >>>> INDENT ++++ INDENT >>>> */

                    } else {
                        throw new NotImplementedError(subchild.tag);

                    }
                }

            } else if (child.tag === "Remarks") {
                blocks.push(<RemarksComponent el={child} indent={indent} key={child.id} />);

            }
            else { assertNever(child); }
        }

        return (
            <div>
                {blocks}
            </div>
        );
    }
}


interface FigStructComponentProps extends ELComponentProps { el: std.FigStruct, indent: number };

const isFigStructComponentProps = (props: ELComponentProps): props is FigStructComponentProps => props.el.tag === "FigStruct"

class FigStructComponent extends BaseLawComponent<FigStructComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        const blocks: JSX.Element[] = [];

        for (const child of el.children) {

            if (child.tag === "FigStructTitle") {
                blocks.push(
                    <div key={child.id}>
                        <RunComponent els={child.children} />
                    </div>
                );

            } else if (child.tag === "Fig") {
                blocks.push(
                    <div key={child.id}>
                        <FigRunComponent el={child} />
                    </div>
                );

            } else if (child.tag === "Remarks") {
                blocks.push(<RemarksComponent el={child} indent={indent} key={child.id} />);

            }
            else { assertNever(child); }
        }

        return (
            <div>
                {blocks}
            </div>
        );
    }
}

interface FigRunComponentProps extends ELComponentProps { el: std.Fig };

const isFigRunComponentProps = (props: ELComponentProps): props is FigRunComponentProps => props.el.tag === "Fig"

class FigRunComponent extends BaseLawComponent<FigRunComponentProps> {
    protected renderNormal() {
        const el = this.props.el;

        if (el.children.length > 0) {
            throw new NotImplementedError(el.outerXML());
        }

        return <span>[{el.attr.src}]</span>;
    }
}




interface AmendProvisionComponentProps extends ELComponentProps { el: std.AmendProvision, indent: number };

const isAmendProvisionComponentProps = (props: ELComponentProps): props is AmendProvisionComponentProps => props.el.tag === "AmendProvision"

class AmendProvisionComponent extends BaseLawComponent<AmendProvisionComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        const blocks: JSX.Element[] = [];

        for (const child of el.children) {

            if (child.tag === "AmendProvisionSentence") {
                blocks.push(<BlockSentenceComponent els={child.children} indent={indent} style={{ textIndent: "1em" }} key={child.id} />);

            } else if (child.tag === "NewProvision") {
                for (const subchild of child.children) {
                    blocks.push(<AnyLawComponent {...{ el: subchild, indent: indent + 1 } as any} key={subchild.id} />);
                }

            }
            else { assertNever(child); }
        }

        return (
            <div>
                {blocks}
            </div>
        );
    }
}




interface SentenceDummyProps extends ELComponentProps { el: std.Sentence, indent: number };

const isSentenceDummyProps = (props: ELComponentProps): props is SentenceDummyProps => props.el.tag === "Sentence"


const FirstColumnSpan = styled.span`
    color: rgb(121, 113, 0);
`;

interface BlockSentenceComponentProps { els: Array<std.Sentence | std.Column | std.Table>, indent: number, Title?: JSX.Element, style?: React.CSSProperties };

class BlockSentenceComponent extends BaseLawComponent<BlockSentenceComponentProps> {
    protected renderNormal() {
        const els = this.props.els;
        const indent = this.props.indent;
        const Title = this.props.Title;
        const style = this.props.style;

        const runs: JSX.Element[] = [];

        if (Title) {
            runs.push(<span key={-2}>{Title}</span>);
            runs.push(<span key={-1}>{MARGIN}</span>);
        }

        for (let i = 0; i < els.length; i++) {
            const el = els[i];

            if (el.tag === "Sentence") {
                runs.push(<RunComponent els={el.children} key={i * 2} />);

            } else if (el.tag === "Column") {
                if (i !== 0) {
                    runs.push(<span key={i * 2}>{MARGIN}</span>);
                }

                const subruns: JSX.Element[] = [];
                for (let j = 0; j < el.children.length; j++) {
                    const subel = el.children[j];
                    subruns.push(<RunComponent els={subel.children} key={j} />);
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
    }
}


interface RunComponentProps { els: Array<string | std.Line | std.QuoteStruct | std.ArithFormula | std.Ruby | std.Sup | std.Sub | std.__EL>, style?: React.CSSProperties };

class RunComponent extends BaseLawComponent<RunComponentProps> {
    protected renderNormal() {
        const els = this.props.els;
        const style = this.props.style;

        const runs: JSX.Element[] = [];


        for (let i = 0; i < els.length; i++) {
            const el = els[i];

            if (isString(el)) {
                runs.push(<span key={i}>{el}</span>);

            } else if (el.isControl) {
                runs.push(<ControlRunComponent el={el} key={i} />);

            } else if (std.isRuby(el)) {
                const rb = el.children
                    .map(c =>
                        isString(c)
                            ? c
                            : !std.isRt(c)
                                ? c.text
                                : ""
                    ).join("");
                const rt = (el.children
                    .filter(c => !isString(c) && std.isRt(c)) as std.Rt[])
                    .map(c => c.text)
                    .join("");
                runs.push(<ruby key={i}>{rb}<rt>{rt}</rt></ruby>);

            } else if (el.tag === "Sub") {
                runs.push(<sub key={i}>{el.text}</sub>);

            } else if (el.tag === "Sup") {
                runs.push(<sup key={i}>{el.text}</sup>);

            } else if (el.tag === "QuoteStruct") {
                runs.push(<span key={i}>{el.outerXML()}</span>);

            } else if (el.tag === "ArithFormula") {
                throw new NotImplementedError(el.tag);

            } else if (el.tag === "Line") {
                throw new NotImplementedError(el.tag);

            }
            else { assertNever(el.tag); }
        }

        return <span style={style}>{runs}</span>;
    }
}


type InlineEL = string | std.Line | std.QuoteStruct | std.ArithFormula | std.Ruby | std.Sup | std.Sub;
const isInlineEL = (obj: string | EL): obj is InlineEL => {
    return isString(obj) || obj.tag === "Line" || obj.tag === "QuoteStruct" || obj.tag === "Ruby" || obj.tag === "Sup" || obj.tag === "Sub";
}
const isControl = (obj: string | EL): obj is std.__EL => {
    return !isString(obj) && obj.isControl;
}

const getInnerRun = (el: EL) => {

    const ChildItems: Array<InlineEL | std.__EL> = [];

    for (const child of el.children) {

        if (isInlineEL(child) || isControl(child)) {
            ChildItems.push(child);
        } else {
            throw new NotImplementedError(el.tag);

        }
    }

    return <RunComponent els={ChildItems} />;
}

interface ControlRunComponentProps extends ELComponentProps { el: std.__EL };

const isControlRunComponentProps = (props: ELComponentProps): props is ControlRunComponentProps => props.el.isControl

class ControlRunComponent extends BaseLawComponent<ControlRunComponentProps> {
    protected renderNormal() {
        const el = this.props.el;

        if (el.tag === "____Declaration") {
            return <____DeclarationComponent el={el} />;

        } else if (el.tag === "____VarRef") {
            return <____VarRefComponent el={el} />;

        } else if (el.tag === "____LawNum") {
            return <____LawNumComponent el={el} />;

        } else if (el.tag === "__Parentheses") {
            return <__ParenthesesComponent el={el} />;

        } else if (el.tag === "__PStart") {
            return <__PStartComponent el={el} />;

        } else if (el.tag === "__PContent") {
            return <__PContentComponent el={el} />;

        } else if (el.tag === "__PEnd") {
            return <__PEndComponent el={el} />;

        } else if (el.tag === "__MismatchStartParenthesis") {
            return <__MismatchStartParenthesisComponent el={el} />;

        } else if (el.tag === "__MismatchEndParenthesis") {
            return <__MismatchEndParenthesisComponent el={el} />;

        } else {
            return getInnerRun(el);
        }
    }
}


const DeclarationSpan = styled.span`
    color: rgb(40, 167, 69);
`;

interface ____DeclarationComponentProps extends ELComponentProps { el: std.__EL };

class ____DeclarationComponent extends BaseLawComponent<____DeclarationComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        return (
            <DeclarationSpan
                data-lawtext_declaration_index={el.attr.declaration_index}
            >
                {getInnerRun(el)}
            </DeclarationSpan>
        );
    }
}




const VarRefSpan = styled.span`
`;

const VarRefTextSpan = styled.span`
    border-bottom: 1px solid rgba(127, 127, 127, 0.3);
    cursor: pointer;
    transition: background-color 0.3s, border-bottom-color 0.3s;
`;

enum VarRefFloatState {
    HIDDEN,
    CLOSED,
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

interface ____VarRefComponentProps extends ELComponentProps { el: std.__EL };

interface ____VarRefComponentState { state: VarRefFloatState, arrowLeft: string }

class ____VarRefComponent extends BaseLawComponent<____VarRefComponentProps, ____VarRefComponentState> {
    private refText = React.createRef<HTMLSpanElement>();
    private refWindow = React.createRef<HTMLSpanElement>();
    constructor(props) {
        super(props, { state: VarRefFloatState.HIDDEN, arrowLeft: "0" });
    }

    public onClick(e: React.MouseEvent<HTMLSpanElement>) {
        if (this.state.state === VarRefFloatState.OPEN) {
            this.setState({ state: VarRefFloatState.CLOSED });
        } else {
            this.setState({ state: VarRefFloatState.OPEN });
            setTimeout(() => {
                this.updateSize();
            }, 30);
        }
    }

    public onAnimationEnd() {
        if (this.state.state === VarRefFloatState.CLOSED) {
            this.setState({ state: VarRefFloatState.HIDDEN });
        }
    }

    public updateSize() {
        if (!this.refText.current || !this.refWindow.current) return;

        const textOffset = this.refText.current.getBoundingClientRect()
        const windowOffset = this.refWindow.current.getBoundingClientRect()

        const textLeft = textOffset ? textOffset.left : 0;
        const windowLeft = windowOffset ? windowOffset.left : 0;
        const relLeft = textLeft - windowLeft;
        const left = Math.max(relLeft, em(0.2));
        this.setState({ arrowLeft: `${left}px` });
    }

    protected renderNormal() {
        const el = this.props.el;

        const varRefTextSpanOnClick = (e: React.MouseEvent<HTMLSpanElement>) => {
            this.onClick(e);
        }

        const animateHeightOnAnimationEnd = () => {
            this.onAnimationEnd();
        }

        const windowOnResize = () => {
            this.updateSize();
        }

        return (
            <VarRefSpan>

                <VarRefTextSpan onClick={varRefTextSpanOnClick} ref={this.refText}>
                    {getInnerRun(el)}
                </VarRefTextSpan>

                <AnimateHeight
                    height={this.state.state === VarRefFloatState.OPEN ? "auto" : 0}
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
                    {(this.state.state !== VarRefFloatState.HIDDEN) && (
                        <VarRefFloatBlockInnerSpan>
                            <EventListener target="window" onResize={windowOnResize} />
                            <VarRefArrowSpan style={{ marginLeft: this.state.arrowLeft }} />
                            <VarRefWindowSpan ref={this.refWindow}>
                                <VarRefView el={el} />
                            </VarRefWindowSpan>
                        </VarRefFloatBlockInnerSpan>
                    )}
                </AnimateHeight>

            </VarRefSpan>
        );
    }
}


interface VarRefViewProps extends ELComponentProps { el: std.__EL };

class VarRefView extends BaseLawComponent<VarRefViewProps> {
    protected renderNormal() {
        const el = this.props.el;

        const analysis = store.getState().lawtextAppPage.analysis;
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
            "ItemTitle", "Subitem1Title", "Subitem2Title", "Subitem3Title",
            "Subitem4Title", "Subitem5Title", "Subitem6Title",
            "Subitem7Title", "Subitem8Title", "Subitem9Title",
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
                    : "表"
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
                        .filter(child => ignoreTags.indexOf(child.tag) < 0)
                ]
            );

            if (std.isArticle(declEl)) {
                return <ArticleComponent el={declEl} indent={0} />;

            } else if (std.isParagraph(declEl) || std.isItem(declEl) || std.isSubitem1(declEl) || std.isSubitem2(declEl) || std.isSubitem3(declEl) || std.isSubitem4(declEl) || std.isSubitem5(declEl) || std.isSubitem6(declEl) || std.isSubitem7(declEl) || std.isSubitem8(declEl) || std.isSubitem9(declEl) || std.isSubitem10(declEl)) {
                return <ParagraphItemComponent el={declEl} indent={0} />;

            } else if (std.isTable(declEl)) {
                return <TableComponent el={declEl} indent={0} />;

            } else {
                throw new NotImplementedError(declEl.tag);

            }
        } else if (std.isEnactStatement(lastContainerEl)) {
            return (
                <div style={{ paddingLeft: "1em", textIndent: "-1em" }}>
                    <span>{names.join("／")}</span>
                    <span>{MARGIN}</span>
                    <RunComponent els={lastContainerEl.children} />
                </div>
            );

        } else {
            throw new NotImplementedError(lastContainerEl.tag);

        }
    }
}


const LawNumA = styled.a`
`;

interface ____LawNumComponentProps extends ELComponentProps { el: std.__EL };

class ____LawNumComponent extends BaseLawComponent<____LawNumComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        return (
            <LawNumA href={`#${el.text}`} target="_blank">
                {getInnerRun(el)}
            </LawNumA>
        );
    }
}




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

interface __ParenthesesComponentProps extends ELComponentProps { el: std.__EL };

class __ParenthesesComponent extends BaseLawComponent<__ParenthesesComponentProps> {
    protected renderNormal() {
        const el = this.props.el;

        const blocks: JSX.Element[] = [];

        for (const child of el.children) {

            if (isString(child)) {
                throw new NotImplementedError("string");

            } else if (child.tag === "__PStart") {
                blocks.push(<__PStartComponent el={child as std.__EL} key={child.id} />);

            } else if (child.tag === "__PContent") {
                blocks.push(<__PContentComponent el={child as std.__EL} key={child.id} />);

            } else if (child.tag === "__PEnd") {
                blocks.push(<__PEndComponent el={child as std.__EL} key={child.id} />);

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
    }
}


const PStartSpan = styled.span`
`;

interface __PStartComponentProps extends ELComponentProps { el: std.__EL };

class __PStartComponent extends BaseLawComponent<__PStartComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        return (
            <PStartSpan
                className="lawtext-analyzed-start-parenthesis"
                data-lawtext_parentheses_type={el.attr.type}
            >
                {getInnerRun(el)}
            </PStartSpan>
        );
    }
}


const PContentSpan = styled.span`
`;

interface __PContentComponentProps extends ELComponentProps { el: std.__EL };

class __PContentComponent extends BaseLawComponent<__PContentComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        return (
            <PContentSpan
                className="lawtext-analyzed-parentheses-content"
                data-lawtext_parentheses_type={el.attr.type}
            >
                {getInnerRun(el)}
            </PContentSpan>
        );
    }
}


const PEndSpan = styled.span`
`;

interface __PEndComponentProps extends ELComponentProps { el: std.__EL };

class __PEndComponent extends BaseLawComponent<__PEndComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        return (
            <PEndSpan
                className="lawtext-analyzed-end-parenthesis"
                data-lawtext_parentheses_type={el.attr.type}
            >
                {getInnerRun(el)}
            </PEndSpan>
        );
    }
}


const MismatchStartParenthesisSpan = styled.span`
`;

interface __MismatchStartParenthesisComponentProps extends ELComponentProps { el: std.__EL };

class __MismatchStartParenthesisComponent extends BaseLawComponent<__MismatchStartParenthesisComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        return (
            <MismatchStartParenthesisSpan>
                {getInnerRun(el)}
            </MismatchStartParenthesisSpan>
        );
    }
}


const MismatchEndParenthesisSpan = styled.span`
`;

interface __MismatchEndParenthesisComponentProps extends ELComponentProps { el: std.__EL };

class __MismatchEndParenthesisComponent extends BaseLawComponent<__MismatchEndParenthesisComponentProps> {
    protected renderNormal() {
        const el = this.props.el;
        return (
            <MismatchEndParenthesisSpan>
                {getInnerRun(el)}
            </MismatchEndParenthesisSpan>
        );
    }
}
