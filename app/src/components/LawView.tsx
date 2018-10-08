import * as React from "react";
import * as $ from "jquery";
import { injectGlobal, default as styled } from 'styled-components';
import AnimateHeight from 'react-animate-height';
import { Dispatchers } from '../containers/LawtextAppPageContainer';
import { LawtextAppPageState, RouteState } from '../states';
import * as std from "../../../core/src/std_law"
import { EL, assertNever, NotImplementedError } from "../../../core/src/util"
import * as analyzer from "../../../core/src/analyzer";
import EventListener from 'react-event-listener';
import { isString } from "util";
import { store } from "../store";
import { LawtextAppPageActions } from "../actions/index";

const MARGIN = "　";

type Props = LawtextAppPageState & Dispatchers & RouteState;

function em(input) {
    var emSize = parseFloat($("body").css("font-size"));
    return (emSize * input);
}


const LawViewDiv = styled.div`
    padding: 2rem 3rem 10rem 3rem;
`;

export class LawView extends React.Component<Props> {
    render() {
        return (
            <LawViewDiv>
                {this.props.hasError && <LawViewError {...this.props} />}
                {this.props.law && <LawComponent el={this.props.law} indent={0} />}
            </LawViewDiv >
        );
    }
}

const LawViewErrorDiv = styled.div`
`;

class LawViewError extends React.Component<Props> {
    render() {
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

    componentDidCatch(error, info) {
        this.setState({ hasError: true, error: error });
        const currentState = store.getState().lawtextAppPage;
        store.dispatch(LawtextAppPageActions.modifyState({ hasError: true, errors: [...currentState.errors, error] }));
    }

    render(): JSX.Element | JSX.Element[] | null | undefined {
        if (this.state.hasError) {
            return this.renderError();
        } else {
            return this.renderNormal();
        }
    }

    renderNormal(): JSX.Element | JSX.Element[] | null | undefined {
        return undefined;
    }

    renderError(): JSX.Element | JSX.Element[] | null | undefined {
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
    renderNormal() {
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
        else if (isPreambleComponentProps(this.props)) { throw new NotImplementedError("Preamble"); }
        else if (isAppdxNoteComponentProps(this.props)) { throw new NotImplementedError("AppdxNote"); }
        else if (isAppdxComponentProps(this.props)) { throw new NotImplementedError("Appdx"); }
        else if (isAppdxFormatComponentProps(this.props)) { throw new NotImplementedError("AppdxFormat"); }
        else if (isSupplNoteComponentProps(this.props)) { throw new NotImplementedError("SupplNote"); }
        else if (isSupplProvisionAppdxTableComponentProps(this.props)) { return <SupplProvisionAppdxTableComponent {...this.props} /> }
        else if (isSupplProvisionAppdxStyleComponentProps(this.props)) { return <SupplProvisionAppdxStyleComponent {...this.props} /> }
        else if (isSupplProvisionAppdxComponentProps(this.props)) { throw new NotImplementedError("SupplProvisionAppdx"); }
        else if (isNoteStructComponentProps(this.props)) { throw new NotImplementedError("NoteStruct"); }
        else if (isFormatStructComponentProps(this.props)) { throw new NotImplementedError("FormatStruct"); }
        else if (isSentenceDummyProps(this.props)) { return <BlockSentenceComponent els={[this.props.el]} indent={this.props.indent} /> }
        else { return assertNever(this.props); }
    }
}


interface PreambleComponentProps extends ELComponentProps { el: std.Preamble, indent: number };
function isPreambleComponentProps(props: ELComponentProps): props is PreambleComponentProps { return props.el.tag === "Preamble"; }

interface AppdxNoteComponentProps extends ELComponentProps { el: std.AppdxNote, indent: number };
function isAppdxNoteComponentProps(props: ELComponentProps): props is AppdxNoteComponentProps { return props.el.tag === "AppdxNote"; }

interface AppdxComponentProps extends ELComponentProps { el: std.Appdx, indent: number };
function isAppdxComponentProps(props: ELComponentProps): props is AppdxComponentProps { return props.el.tag === "Appdx"; }

interface AppdxFormatComponentProps extends ELComponentProps { el: std.AppdxFormat, indent: number };
function isAppdxFormatComponentProps(props: ELComponentProps): props is AppdxFormatComponentProps { return props.el.tag === "AppdxFormat"; }

interface SupplNoteComponentProps extends ELComponentProps { el: std.SupplNote, indent: number };
function isSupplNoteComponentProps(props: ELComponentProps): props is SupplNoteComponentProps { return props.el.tag === "SupplNote"; }

interface SupplProvisionAppdxComponentProps extends ELComponentProps { el: std.SupplProvisionAppdx, indent: number };
function isSupplProvisionAppdxComponentProps(props: ELComponentProps): props is SupplProvisionAppdxComponentProps { return props.el.tag === "SupplProvisionAppdx"; }

interface NoteStructComponentProps extends ELComponentProps { el: std.NoteStruct, indent: number };
function isNoteStructComponentProps(props: ELComponentProps): props is NoteStructComponentProps { return props.el.tag === "NoteStruct"; }

interface FormatStructComponentProps extends ELComponentProps { el: std.FormatStruct, indent: number };
function isFormatStructComponentProps(props: ELComponentProps): props is FormatStructComponentProps { return props.el.tag === "FormatStruct"; }














interface LawComponentProps extends ELComponentProps { el: std.Law, indent: number };

function isLawComponentProps(props: ELComponentProps): props is LawComponentProps { return props.el.tag === "Law"; }

class LawComponent extends BaseLawComponent<LawComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;
        let LawNum = "";
        let LawBody: std.LawBody | undefined = undefined;
        for (let child of el.children) {
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

function isLawBodyComponentProps(props: ELComponentProps): props is LawBodyComponentProps { return props.el.tag === "LawBody"; }

class LawBodyComponent extends BaseLawComponent<LawBodyComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;
        const LawNum = this.props.LawNum;

        let blocks: JSX.Element[] = [];
        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];

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

            } else if (child.tag === "EnactStatement") {
                blocks.push(<EnactStatementComponent el={child} indent={indent} key={child.id} />);

            }
            else if (child.tag === "Preamble") { throw new NotImplementedError(child.tag); }
            else if (child.tag === "AppdxNote") { throw new NotImplementedError(child.tag); }
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

function isLawTitleComponentProps(props: ELComponentProps): props is LawTitleComponentProps { return props.el.tag === "LawTitle"; }

class LawTitleComponent extends BaseLawComponent<LawTitleComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;
        const LawNum = this.props.LawNum;

        return (
            <div>
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



const EnactStatementDiv = styled.div`
    clear: both;
    padding-top: 1em;
    text-indent: 1em;
`;

interface EnactStatementComponentProps extends ELComponentProps { el: std.EnactStatement, indent: number };

function isEnactStatementComponentProps(props: ELComponentProps): props is EnactStatementComponentProps { return props.el.tag === "EnactStatement"; }

class EnactStatementComponent extends BaseLawComponent<EnactStatementComponentProps> {
    renderNormal() {
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

function isTOCComponentProps(props: ELComponentProps): props is TOCComponentProps { return props.el.tag === "TOC"; }

class TOCComponent extends BaseLawComponent<TOCComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];
        let tocLabelText: string = "";
        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];

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
                data-toplevel_container_info={JSON.stringify({ tag: el.tag, id: tocLabelText })}
            >
                {blocks}
            </TOCDiv>
        );
    }
}



interface TOCItemComponentProps extends ELComponentProps { el: std.TOCPart | std.TOCChapter | std.TOCSection | std.TOCSubsection | std.TOCDivision | std.TOCSupplProvision | std.TOCArticle | std.TOCAppdxTableLabel, indent: number };

function isTOCItemComponentProps(props: ELComponentProps): props is TOCItemComponentProps {
    return props.el.tag === "TOCPart" || props.el.tag === "TOCPart" || props.el.tag === "TOCChapter" || props.el.tag === "TOCSection" || props.el.tag === "TOCSubsection" || props.el.tag === "TOCDivision" || props.el.tag === "TOCSupplProvision" || props.el.tag === "TOCArticle" || props.el.tag === "TOCAppdxTableLabel";
}

class TOCItemComponent extends BaseLawComponent<TOCItemComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];
        if (el.tag === "TOCArticle") {
            let ArticleTitle: std.ArticleTitle | null = null;
            let ArticleCaption: std.ArticleCaption | null = null;
            for (let child of el.children) {
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
            let TOCItems: (std.TOCChapter | std.TOCSection | std.TOCSubsection | std.TOCDivision | std.TOCArticle)[] = [];
            for (let i = 0; i < el.children.length; i++) {
                const child = el.children[i];

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
            for (let i = 0; i < TOCItems.length; i++) {
                const TOCItem = TOCItems[i];
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

function isAppdxTableComponentProps(props: ELComponentProps): props is AppdxTableComponentProps { return props.el.tag === "AppdxTable"; }

class AppdxTableComponent extends BaseLawComponent<AppdxTableComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        let AppdxTableTitle: std.AppdxTableTitle | null = null;
        let RelatedArticleNum: std.RelatedArticleNum | null = null;
        let ChildItems: (std.TableStruct | std.Item | std.Remarks)[] = [];
        for (let child of el.children) {

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

        for (let i = 0; i < ChildItems.length; i++) {
            const child = ChildItems[i];
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
                data-toplevel_container_info={JSON.stringify({ tag: el.tag, id: AppdxTableTitle && AppdxTableTitle.text })}
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

function isAppdxStyleComponentProps(props: ELComponentProps): props is AppdxStyleComponentProps { return props.el.tag === "AppdxStyle"; }

class AppdxStyleComponent extends BaseLawComponent<AppdxStyleComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        let AppdxStyleTitle: std.AppdxStyleTitle | null = null;
        let RelatedArticleNum: std.RelatedArticleNum | null = null;
        let ChildItems: (std.StyleStruct | std.Item | std.Remarks)[] = [];
        for (let child of el.children) {

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

        for (let i = 0; i < ChildItems.length; i++) {
            const child = ChildItems[i];
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
                data-toplevel_container_info={JSON.stringify({ tag: el.tag, id: AppdxStyleTitle && AppdxStyleTitle.text })}
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

function isAppdxFigComponentProps(props: ELComponentProps): props is AppdxFigComponentProps { return props.el.tag === "AppdxFig"; }

class AppdxFigComponent extends BaseLawComponent<AppdxFigComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        let AppdxFigTitle: std.AppdxFigTitle | null = null;
        let RelatedArticleNum: std.RelatedArticleNum | null = null;
        let ChildItems: (std.TableStruct | std.FigStruct)[] = [];
        for (let child of el.children) {

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

        for (let i = 0; i < ChildItems.length; i++) {
            const child = ChildItems[i];
            if (child.tag === "TableStruct") {
                blocks.push(<TableStructComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "FigStruct") {
                blocks.push(<FigStructComponent el={child} indent={indent + 1} key={child.id} />); /* >>>> INDENT >>>> */

            }
            else { assertNever(child); }
        }

        return (
            <AppdxFigDiv
                data-toplevel_container_info={JSON.stringify({ tag: el.tag, id: AppdxFigTitle && AppdxFigTitle.text })}
            >
                {blocks}
            </AppdxFigDiv>
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

function isSupplProvisionAppdxTableComponentProps(props: ELComponentProps): props is SupplProvisionAppdxTableComponentProps { return props.el.tag === "SupplProvisionAppdxTable"; }

class SupplProvisionAppdxTableComponent extends BaseLawComponent<SupplProvisionAppdxTableComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        let SupplProvisionAppdxTableTitle: std.SupplProvisionAppdxTableTitle | null = null;
        let RelatedArticleNum: std.RelatedArticleNum | null = null;
        let ChildItems: (std.TableStruct | std.Item | std.Remarks)[] = [];
        for (let child of el.children) {

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

        for (let i = 0; i < ChildItems.length; i++) {
            const child = ChildItems[i];
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
            <SupplProvisionAppdxTableDiv
                data-toplevel_container_info={JSON.stringify({ tag: el.tag, id: SupplProvisionAppdxTableTitle && SupplProvisionAppdxTableTitle.text })}
            >
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

function isSupplProvisionAppdxStyleComponentProps(props: ELComponentProps): props is SupplProvisionAppdxStyleComponentProps { return props.el.tag === "SupplProvisionAppdxStyle"; }

class SupplProvisionAppdxStyleComponent extends BaseLawComponent<SupplProvisionAppdxStyleComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        let SupplProvisionAppdxStyleTitle: std.SupplProvisionAppdxStyleTitle | null = null;
        let RelatedArticleNum: std.RelatedArticleNum | null = null;
        let ChildItems: (std.StyleStruct | std.Item | std.Remarks)[] = [];
        for (let child of el.children) {

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

        for (let i = 0; i < ChildItems.length; i++) {
            const child = ChildItems[i];
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
            <SupplProvisionAppdxStyleDiv
                data-toplevel_container_info={JSON.stringify({ tag: el.tag, id: SupplProvisionAppdxStyleTitle && SupplProvisionAppdxStyleTitle.text })}
            >
                {blocks}
            </SupplProvisionAppdxStyleDiv>
        );
    }
}



interface SupplProvisionComponentProps extends ELComponentProps { el: std.SupplProvision, indent: number };

function isSupplProvisionComponentProps(props: ELComponentProps): props is SupplProvisionComponentProps { return props.el.tag === "SupplProvision"; }

class SupplProvisionComponent extends BaseLawComponent<SupplProvisionComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        let SupplProvisionLabel: std.SupplProvisionLabel | null = null;
        let ChildItems: (std.Chapter | std.Article | std.Paragraph | std.SupplProvisionAppdxTable | std.SupplProvisionAppdxStyle | std.SupplProvisionAppdx)[] = [];
        for (let child of el.children) {

            if (child.tag === "SupplProvisionLabel") {
                SupplProvisionLabel = child;

            } else {
                ChildItems.push(child);
            }
        }

        if (SupplProvisionLabel) {
            let Extract = el.attr.Extract == "true" ? `${MARGIN}抄` : "";
            let AmendLawNum = el.attr.AmendLawNum ? `（${el.attr.AmendLawNum}）` : "";
            blocks.push(
                <ArticleGroupTitleDiv
                    style={{ marginLeft: `${indent + 3}em` }}
                    key={SupplProvisionLabel.id}
                >
                    <RunComponent els={SupplProvisionLabel.children} />{AmendLawNum}{Extract}
                </ArticleGroupTitleDiv>
            );
        }

        for (let i = 0; i < ChildItems.length; i++) {
            const child = ChildItems[i];
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
                data-toplevel_container_info={JSON.stringify({ tag: el.tag, id: el.attr.AmendLawNum })}
            >
                {blocks}
            </div>
        );
    }
}

interface ArticleGroupComponentProps extends ELComponentProps { el: std.MainProvision | std.Part | std.Chapter | std.Section | std.Subsection | std.Division, indent: number };

function isArticleGroupComponentProps(props: ELComponentProps): props is ArticleGroupComponentProps { return props.el.tag === "MainProvision" || props.el.tag === "Part" || props.el.tag === "Chapter" || props.el.tag === "Section" || props.el.tag === "Subsection" || props.el.tag === "Division"; }

class ArticleGroupComponent extends BaseLawComponent<ArticleGroupComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        let ArticleGroupTitle: std.PartTitle | std.ChapterTitle | std.SectionTitle | std.SubsectionTitle | std.DivisionTitle | null = null;
        let ChildItems: (std.Part | std.Chapter | std.Section | std.Subsection | std.Division | std.Article | std.Paragraph)[] = [];
        for (let child of el.children) {

            if (child.tag === "PartTitle" || child.tag === "ChapterTitle" || child.tag === "SectionTitle" || child.tag === "SubsectionTitle" || child.tag === "DivisionTitle") {
                ArticleGroupTitle = child;

            } else {
                ChildItems.push(child);
            }
        }

        if (ArticleGroupTitle) {
            blocks.push(<ArticleGroupTitleComponent el={ArticleGroupTitle} indent={indent} key={ArticleGroupTitle.id} />);
        }

        for (let i = 0; i < ChildItems.length; i++) {
            const child = ChildItems[i];
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
                <div data-toplevel_container_info={JSON.stringify({ tag: el.tag })}>
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

function isArticleGroupTitleComponentProps(props: ELComponentProps): props is ArticleGroupTitleComponentProps { return props.el.tag === "PartTitle" || props.el.tag === "ChapterTitle" || props.el.tag === "SectionTitle" || props.el.tag === "SubsectionTitle" || props.el.tag === "DivisionTitle"; }

class ArticleGroupTitleComponent extends BaseLawComponent<ArticleGroupTitleComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        let titleIndent =
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

function isArticleComponentProps(props: ELComponentProps): props is ArticleComponentProps { return props.el.tag === "Article"; }

class ArticleComponent extends BaseLawComponent<ArticleComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        let ArticleCaption: std.ArticleCaption | null = null;
        let ArticleTitle: std.ArticleTitle | null = null;
        let Paragraphs: std.Paragraph[] = [];
        for (let child of el.children) {

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
            let Paragraph = Paragraphs[i];
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
                data-container_info={JSON.stringify({ tag: el.tag, id: el.attr.Num })}
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

function isParagraphItemComponentProps(props: ELComponentProps): props is ParagraphItemComponentProps { return props.el.tag === "Paragraph" || props.el.tag === "Item" || props.el.tag === "Subitem1" || props.el.tag === "Subitem2" || props.el.tag === "Subitem3" || props.el.tag === "Subitem4" || props.el.tag === "Subitem5" || props.el.tag === "Subitem6" || props.el.tag === "Subitem7" || props.el.tag === "Subitem8" || props.el.tag === "Subitem9" || props.el.tag === "Subitem10"; }

class ParagraphItemComponent extends BaseLawComponent<ParagraphItemComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;
        const ArticleTitle = this.props.ArticleTitle;

        let blocks: JSX.Element[] = [];

        let ParagraphCaption: std.ParagraphCaption | null = null;
        let ParagraphItemTitle: std.ParagraphNum | std.ItemTitle | std.Subitem1Title | std.Subitem2Title | std.Subitem3Title | std.Subitem4Title | std.Subitem5Title | std.Subitem6Title | std.Subitem7Title | std.Subitem8Title | std.Subitem9Title | std.Subitem10Title | null = null;
        let ParagraphItemSentence: std.ParagraphSentence | std.ItemSentence | std.Subitem1Sentence | std.Subitem2Sentence | std.Subitem3Sentence | std.Subitem4Sentence | std.Subitem5Sentence | std.Subitem6Sentence | std.Subitem7Sentence | std.Subitem8Sentence | std.Subitem9Sentence | std.Subitem10Sentence | undefined = undefined;
        let Children: (std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10 | std.AmendProvision | std.Class | std.TableStruct | std.FigStruct | std.StyleStruct | std.List)[] = [];
        for (let child of el.children) {

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

        let Title = (
            <span style={{ fontWeight: "bold" }}>
                {ParagraphItemTitle && <RunComponent els={ParagraphItemTitle.children} />}
                {ArticleTitle && <RunComponent els={ArticleTitle.children} />}
            </span>
        );
        let SentenceChildren = ParagraphItemSentence ? ParagraphItemSentence.children : [];
        blocks.push(
            <BlockSentenceComponent
                els={SentenceChildren}
                indent={indent}
                Title={Title}
                style={{ paddingLeft: "1em", textIndent: "-1em" }}
                key={-1}
            />
        );

        for (let i = 0; i < Children.length; i++) {
            const child = Children[i];
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
                        data-container_info={JSON.stringify({ tag: el.tag, id: el.attr.Num })}
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

function isListComponentProps(props: ELComponentProps): props is ListComponentProps { return props.el.tag === "List" || props.el.tag === "Sublist1" || props.el.tag === "Sublist2" || props.el.tag === "Sublist3"; }

class ListComponent extends BaseLawComponent<ListComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];

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

function isTableStructComponentProps(props: ELComponentProps): props is TableStructComponentProps { return props.el.tag === "TableStruct"; }

class TableStructComponent extends BaseLawComponent<TableStructComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];

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

function isTableComponentProps(props: ELComponentProps): props is TableComponentProps { return props.el.tag === "Table"; }

class TableComponent extends BaseLawComponent<TableComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        let rows: JSX.Element[] = [];

        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];

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

function isRemarksComponentProps(props: ELComponentProps): props is RemarksComponentProps { return props.el.tag === "Remarks"; }

class RemarksComponent extends BaseLawComponent<RemarksComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        let RemarksLabel: std.RemarksLabel | null = null;
        let ChildItems: (std.Item | std.Sentence)[] = [];
        for (let child of el.children) {

            if (child.tag === "RemarksLabel") {
                RemarksLabel = child;

            } else {
                ChildItems.push(child);
            }
        }

        for (let i = 0; i < ChildItems.length; i++) {
            let child = ChildItems[i];

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
                if (i == 0 && RemarksLabel) {
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

function isTableRowComponentProps(props: ELComponentProps): props is TableRowComponentProps { return props.el.tag === "TableRow" || props.el.tag === "TableHeaderRow"; }

class TableRowComponent extends BaseLawComponent<TableRowComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        let columns: JSX.Element[] = [];

        for (let i = 0; i < el.children.length; i++) {
            let child = el.children[i];

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

function isTableColumnComponentProps(props: ELComponentProps): props is TableColumnComponentProps { return props.el.tag === "TableColumn" || props.el.tag === "TableHeaderColumn"; }

class TableColumnComponent extends BaseLawComponent<TableColumnComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        if (el.tag === "TableHeaderColumn") {
            blocks.push(
                <div key={el.id}>
                    <RunComponent els={el.children} />
                </div>
            );

        } else if (el.tag === "TableColumn") {
            for (let i = 0; i < el.children.length; i++) {
                let child = el.children[i];

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
            let style: React.CSSProperties = {};
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

function isStyleStructComponentProps(props: ELComponentProps): props is StyleStructComponentProps { return props.el.tag === "StyleStruct"; }

class StyleStructComponent extends BaseLawComponent<StyleStructComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];

            if (child.tag === "StyleStructTitle") {
                blocks.push(
                    <div key={child.id}>
                        <RunComponent els={child.children} />
                    </div>
                );

            } else if (child.tag === "Style") {

                for (let subchild of child.children) {
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

function isFigStructComponentProps(props: ELComponentProps): props is FigStructComponentProps { return props.el.tag === "FigStruct"; }

class FigStructComponent extends BaseLawComponent<FigStructComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];

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

function isFigRunComponentProps(props: ELComponentProps): props is FigRunComponentProps { return props.el.tag === "Fig"; }

class FigRunComponent extends BaseLawComponent<FigRunComponentProps> {
    renderNormal() {
        const el = this.props.el;

        if (el.children.length > 0) {
            throw new NotImplementedError(el.outerXML());
        }

        return <span>[{el.attr.src}]</span>;
    }
}




interface AmendProvisionComponentProps extends ELComponentProps { el: std.AmendProvision, indent: number };

function isAmendProvisionComponentProps(props: ELComponentProps): props is AmendProvisionComponentProps { return props.el.tag === "AmendProvision"; }

class AmendProvisionComponent extends BaseLawComponent<AmendProvisionComponentProps> {
    renderNormal() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];

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

function isSentenceDummyProps(props: ELComponentProps): props is SentenceDummyProps { return props.el.tag === "Sentence"; }


const FirstColumnSpan = styled.span`
    color: rgb(121, 113, 0);
`;

interface BlockSentenceComponentProps { els: (std.Sentence | std.Column | std.Table)[], indent: number, Title?: JSX.Element, style?: React.CSSProperties };

class BlockSentenceComponent extends BaseLawComponent<BlockSentenceComponentProps> {
    renderNormal() {
        const els = this.props.els;
        const indent = this.props.indent;
        const Title = this.props.Title;
        const style = this.props.style;

        let runs: JSX.Element[] = [];

        if (Title) {
            runs.push(<span key={-2}>{Title}</span>);
            runs.push(<span key={-1}>{MARGIN}</span>);
        }

        for (let i = 0; i < els.length; i++) {
            let el = els[i];

            if (el.tag === "Sentence") {
                runs.push(<RunComponent els={el.children} key={i * 2} />);

            } else if (el.tag === "Column") {
                if (i != 0) {
                    runs.push(<span key={i * 2}>{MARGIN}</span>);
                }

                let subruns: JSX.Element[] = [];
                for (let j = 0; j < el.children.length; j++) {
                    let subel = el.children[j];
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


interface RunComponentProps { els: (string | std.Line | std.QuoteStruct | std.ArithFormula | std.Ruby | std.Sup | std.Sub | std.__EL)[], style?: React.CSSProperties };

class RunComponent extends BaseLawComponent<RunComponentProps> {
    renderNormal() {
        const els = this.props.els;
        const style = this.props.style;

        let runs: JSX.Element[] = [];


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
function isInlineEL(obj: string | EL): obj is InlineEL {
    return isString(obj) || obj.tag === "Line" || obj.tag === "QuoteStruct" || obj.tag === "Ruby" || obj.tag === "Sup" || obj.tag === "Sub";
}
function isControl(obj: string | EL): obj is std.__EL {
    return !isString(obj) && obj.isControl;
}

function getInnerRun(el: EL) {

    let ChildItems: (InlineEL | std.__EL)[] = [];

    for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i];

        if (isInlineEL(child) || isControl(child)) {
            ChildItems.push(child);
        } else {
            throw new NotImplementedError(el.tag);

        }
    }

    return <RunComponent els={ChildItems} />;
}

interface ControlRunComponentProps extends ELComponentProps { el: std.__EL };

function isControlRunComponentProps(props: ELComponentProps): props is ControlRunComponentProps { return props.el.isControl; }

class ControlRunComponent extends BaseLawComponent<ControlRunComponentProps> {
    renderNormal() {
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


const ____DeclarationSpan = styled.span`
    color: rgb(40, 167, 69);
`;

interface ____DeclarationComponentProps extends ELComponentProps { el: std.__EL };

class ____DeclarationComponent extends BaseLawComponent<____DeclarationComponentProps> {
    renderNormal() {
        const el = this.props.el;
        return (
            <____DeclarationSpan
                data-lawtext_declaration_index={el.attr.declaration_index}
            >
                {getInnerRun(el)}
            </____DeclarationSpan>
        );
    }
}



injectGlobal`
.lawtext-varref-open .lawtext-varref-text {
    background-color: rgba(127, 127, 127, 0.15);
    border-bottom: 1px solid rgb(40, 167, 69);
}

.lawtext-varref-text:hover {
    background-color: rgb(255, 249, 160);
    border-bottom: 1px solid rgb(40, 167, 69);
}
`;

const ____VarRefSpan = styled.span`
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

type ____VarRefComponentState = { state: VarRefFloatState, arrowLeft: string };

class ____VarRefComponent extends BaseLawComponent<____VarRefComponentProps, ____VarRefComponentState> {
    private refText = React.createRef<HTMLSpanElement>();
    private refWindow = React.createRef<HTMLSpanElement>();
    constructor(props) {
        super(props, { state: VarRefFloatState.HIDDEN, arrowLeft: "0" });
    }

    onClick(e: React.MouseEvent<HTMLSpanElement>) {
        if (this.state.state === VarRefFloatState.OPEN) {
            this.setState({ state: VarRefFloatState.CLOSED });
        } else {
            this.setState({ state: VarRefFloatState.OPEN });
            setTimeout(() => {
                this.updateSize();
            }, 30);
        }
    }

    onAnimationEnd() {
        if (this.state.state === VarRefFloatState.CLOSED) {
            this.setState({ state: VarRefFloatState.HIDDEN });
        }
    }

    updateSize() {
        if (!this.refText.current || !this.refWindow.current) return;

        let text_offset = this.refText.current.getBoundingClientRect()
        let window_offset = this.refWindow.current.getBoundingClientRect()

        let text_left = text_offset ? text_offset.left : 0;
        let window_left = window_offset ? window_offset.left : 0;
        let rel_left = text_left - window_left;
        let left = Math.max(rel_left, em(0.2));
        this.setState({ arrowLeft: `${left}px` });
    }

    renderNormal() {
        const el = this.props.el;

        return (
            <____VarRefSpan>

                <VarRefTextSpan onClick={e => this.onClick(e)} innerRef={this.refText}>
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
                    onAnimationEnd={() => this.onAnimationEnd()}
                >
                    {(this.state.state !== VarRefFloatState.HIDDEN) && (
                        <VarRefFloatBlockInnerSpan>
                            <EventListener target="window" onResize={() => this.updateSize()} />
                            <VarRefArrowSpan style={{ marginLeft: this.state.arrowLeft }} />
                            <VarRefWindowSpan innerRef={this.refWindow}>
                                <VarRefView el={el} />
                            </VarRefWindowSpan>
                        </VarRefFloatBlockInnerSpan>
                    )}
                </AnimateHeight>

            </____VarRefSpan>
        );
    }
}


interface VarRefViewProps extends ELComponentProps { el: std.__EL };

class VarRefView extends BaseLawComponent<VarRefViewProps> {
    renderNormal() {
        const el = this.props.el;

        const analysis = store.getState().lawtextAppPage.analysis;
        if (!analysis) return null;

        const declaration_index = Number(el.attr.ref_declaration_index);
        const declaration = analysis.declarations.get(declaration_index);
        const decl_container = declaration.name_pos.env.container;
        const container_stack = decl_container.linealAscendant();
        const names: string[] = [];
        let last_container_el = decl_container.el;

        const title_tags = [
            "ArticleTitle",
            "ParagraphNum",
            "ItemTitle", "Subitem1Title", "Subitem2Title", "Subitem3Title",
            "Subitem4Title", "Subitem5Title", "Subitem6Title",
            "Subitem7Title", "Subitem8Title", "Subitem9Title",
            "Subitem10Title",
            "TableStructTitle",
        ];
        const ignore_tags = ["ArticleCaption", "ParagraphCaption", ...title_tags];

        for (const container of container_stack) {
            if (std.isEnactStatement(container.el)) {
                names.push("（制定文）");

            } else if (std.isArticle(container.el)) {
                let article_title = container.el.children
                    .find(child => child.tag === "ArticleTitle") as std.ArticleTitle;
                if (article_title) names.push(article_title.text);

            } else if (std.isParagraph(container.el)) {
                let paragraph_num = container.el.children
                    .find(child => child.tag === "ParagraphNum") as std.ParagraphNum;
                if (paragraph_num) names.push(paragraph_num.text || "１");

            } else if (std.isItem(container.el) || std.isSubitem1(container.el) || std.isSubitem2(container.el) || std.isSubitem3(container.el) || std.isSubitem4(container.el) || std.isSubitem5(container.el) || std.isSubitem6(container.el) || std.isSubitem7(container.el) || std.isSubitem8(container.el) || std.isSubitem9(container.el) || std.isSubitem10(container.el)) {
                let item_title = (container.el.children as EL[])
                    .find(child => child.tag === `${container.el.tag}Title`);
                if (item_title) names.push(item_title.text);

            } else if (std.isTableStruct(container.el)) {
                let table_struct_title_el = container.el.children
                    .find(child => child.tag === "TableStructTitle");
                let table_struct_title = table_struct_title_el
                    ? table_struct_title_el.text
                    : "表"
                names.push(table_struct_title + "（抜粋）");

            } else {
                continue;
            }
            last_container_el = container.el;
        }

        const decl_el_title_tag = title_tags
            .find(s => Boolean(s) && s.startsWith(last_container_el.tag));

        if (decl_el_title_tag) {
            const decl_el = new EL(
                last_container_el.tag,
                {},
                [
                    new EL(decl_el_title_tag, {}, [names.join("／")]),
                    ...(last_container_el.children as EL[])
                        .filter(child => ignore_tags.indexOf(child.tag) < 0)
                ]
            );

            if (std.isArticle(decl_el)) {
                return <ArticleComponent el={decl_el} indent={0} />;

            } else if (std.isParagraph(decl_el) || std.isItem(decl_el) || std.isSubitem1(decl_el) || std.isSubitem2(decl_el) || std.isSubitem3(decl_el) || std.isSubitem4(decl_el) || std.isSubitem5(decl_el) || std.isSubitem6(decl_el) || std.isSubitem7(decl_el) || std.isSubitem8(decl_el) || std.isSubitem9(decl_el) || std.isSubitem10(decl_el)) {
                return <ParagraphItemComponent el={decl_el} indent={0} />;

            } else if (std.isTable(decl_el)) {
                return <TableComponent el={decl_el} indent={0} />;

            } else {
                throw new NotImplementedError(decl_el.tag);

            }
        } else if (std.isEnactStatement(last_container_el)) {
            return (
                <div style={{ paddingLeft: "1em", textIndent: "-1em" }}>
                    <span>{names.join("／")}</span>
                    <span>{MARGIN}</span>
                    <RunComponent els={last_container_el.children} />
                </div>
            );

        } else {
            throw new NotImplementedError(last_container_el.tag);

        }
    }
}


const ____LawNumA = styled.a`
`;

interface ____LawNumComponentProps extends ELComponentProps { el: std.__EL };

class ____LawNumComponent extends BaseLawComponent<____LawNumComponentProps> {
    renderNormal() {
        const el = this.props.el;
        return (
            <____LawNumA href={`#${el.text}`} target="_blank">
                {getInnerRun(el)}
            </____LawNumA>
        );
    }
}





injectGlobal`
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

const __ParenthesesSpan = styled.span`
`;

interface __ParenthesesComponentProps extends ELComponentProps { el: std.__EL };

class __ParenthesesComponent extends BaseLawComponent<__ParenthesesComponentProps> {
    renderNormal() {
        const el = this.props.el;

        let blocks: JSX.Element[] = [];

        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];

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
            <__ParenthesesSpan
                className="lawtext-analyzed-parentheses"
                data-lawtext_parentheses_type={el.attr.type}
                data-lawtext_parentheses_depth={el.attr.depth}
            >
                {blocks}
            </__ParenthesesSpan>
        );
    }
}


const __PStartSpan = styled.span`
`;

interface __PStartComponentProps extends ELComponentProps { el: std.__EL };

class __PStartComponent extends BaseLawComponent<__PStartComponentProps> {
    renderNormal() {
        const el = this.props.el;
        return (
            <__PStartSpan
                className="lawtext-analyzed-start-parenthesis"
                data-lawtext_parentheses_type={el.attr.type}
            >
                {getInnerRun(el)}
            </__PStartSpan>
        );
    }
}


const __PContentSpan = styled.span`
`;

interface __PContentComponentProps extends ELComponentProps { el: std.__EL };

class __PContentComponent extends BaseLawComponent<__PContentComponentProps> {
    renderNormal() {
        const el = this.props.el;
        return (
            <__PContentSpan
                className="lawtext-analyzed-parentheses-content"
                data-lawtext_parentheses_type={el.attr.type}
            >
                {getInnerRun(el)}
            </__PContentSpan>
        );
    }
}


const __PEndSpan = styled.span`
`;

interface __PEndComponentProps extends ELComponentProps { el: std.__EL };

class __PEndComponent extends BaseLawComponent<__PEndComponentProps> {
    renderNormal() {
        const el = this.props.el;
        return (
            <__PEndSpan
                className="lawtext-analyzed-end-parenthesis"
                data-lawtext_parentheses_type={el.attr.type}
            >
                {getInnerRun(el)}
            </__PEndSpan>
        );
    }
}


const __MismatchStartParenthesisSpan = styled.span`
`;

interface __MismatchStartParenthesisComponentProps extends ELComponentProps { el: std.__EL };

class __MismatchStartParenthesisComponent extends BaseLawComponent<__MismatchStartParenthesisComponentProps> {
    renderNormal() {
        const el = this.props.el;
        return (
            <__MismatchStartParenthesisSpan>
                {getInnerRun(el)}
            </__MismatchStartParenthesisSpan>
        );
    }
}


const __MismatchEndParenthesisSpan = styled.span`
`;

interface __MismatchEndParenthesisComponentProps extends ELComponentProps { el: std.__EL };

class __MismatchEndParenthesisComponent extends BaseLawComponent<__MismatchEndParenthesisComponentProps> {
    renderNormal() {
        const el = this.props.el;
        return (
            <__MismatchEndParenthesisSpan>
                {getInnerRun(el)}
            </__MismatchEndParenthesisSpan>
        );
    }
}
