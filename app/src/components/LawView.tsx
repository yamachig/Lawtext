import * as React from "react";
import styled from 'styled-components';
import { Dispatchers } from '../containers/LawtextAppPageContainer';
import { LawtextAppPageState, RouteState } from '../states';
import * as std from "../../../js/src/std_law"
import { assertNever, NotImplementedError } from "../../../js/src/util"
import { isString } from "util";

const MARGIN = "　";

type Props = LawtextAppPageState & Dispatchers & RouteState;


const LawViewDiv = styled.div`
    padding: 2rem 3rem 10rem 3rem;
`;

export class LawView extends React.Component<Props> {
    render() {
        if (!this.props.law) return null;
        return (
            <LawViewDiv>
                <LawComponent el={this.props.law} indent={0} />
            </LawViewDiv >
        );
    }
}


class LawComponent extends React.Component<{ el: std.Law, indent: number }> {
    render() {
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




class LawBodyComponent extends React.Component<{ el: std.LawBody, indent: number, LawNum: string }> {
    render() {
        const el = this.props.el;
        const indent = this.props.indent;
        const LawNum = this.props.LawNum;

        let blocks: JSX.Element[] = [];
        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];

            if (child.tag === "LawTitle") {
                blocks.push(<LawTitleComponent el={child} indent={indent} LawNum={LawNum} key={i} />);

            } else if (child.tag === "TOC") {
                blocks.push(<TOCComponent el={child} indent={indent} key={i} />);

            } else if (child.tag === "MainProvision") {
                blocks.push(<ArticleGroupComponent el={child} indent={indent} key={i} />);

            } else if (child.tag === "SupplProvision") {
                blocks.push(<SupplProvisionComponent el={child} indent={indent} key={i} />);

            } else if (child.tag === "AppdxTable") {
                blocks.push(<AppdxTableComponent el={child} indent={indent} key={i} />);

            } else if (child.tag === "AppdxStyle") {
                blocks.push(<AppdxStyleComponent el={child} indent={indent} key={i} />);

            } else if (child.tag === "EnactStatement") {
                blocks.push(<EnactStatementComponent el={child} indent={indent} key={i} />);

            }
            else if (child.tag === "Preamble") { throw new NotImplementedError(child.tag); }
            else if (child.tag === "AppdxNote") { throw new NotImplementedError(child.tag); }
            else if (child.tag === "Appdx") { throw new NotImplementedError(child.tag); }
            else if (child.tag === "AppdxFig") { throw new NotImplementedError(child.tag); }
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

class LawTitleComponent extends React.Component<{ el: std.LawTitle, indent: number, LawNum: string }> {
    render() {
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

class EnactStatementComponent extends React.Component<{ el: std.EnactStatement, indent: number }> {
    render() {
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

class TOCComponent extends React.Component<{ el: std.TOC, indent: number }> {
    render() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];
        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];

            if (child.tag === "TOCLabel") {

                blocks.push(
                    <div className="law-anchor"
                        data-tag={el.tag}
                        data-name={el.text}
                        style={{ marginLeft: `${indent}em` }}
                        key={i}
                    >
                        {child.text}
                    </div>
                );

            } else if (child.tag === "TOCPart" || child.tag === "TOCChapter" || child.tag === "TOCSection" || child.tag === "TOCSupplProvision" || child.tag === "TOCArticle" || child.tag === "TOCAppdxTableLabel") {
                blocks.push(<TOCItemComponent el={child} indent={indent + 1} key={i} />); /* >>>> INDENT >>>> */

            }
            else if (child.tag === "TOCPreambleLabel") { throw new NotImplementedError(child.tag); }
            else { assertNever(child); }
        }

        return (
            <TOCDiv>
                {blocks}
            </TOCDiv>
        );
    }
}




class TOCItemComponent extends React.Component<{ el: std.TOCPart | std.TOCChapter | std.TOCSection | std.TOCSubsection | std.TOCDivision | std.TOCSupplProvision | std.TOCArticle | std.TOCAppdxTableLabel, indent: number }> {
    render() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];
        if (el.tag === "TOCArticle") {
            let ArticleTitle: JSX.Element | null = null;
            let ArticleCaption: JSX.Element | null = null;
            for (let child of el.children) {
                if (child.tag === "ArticleTitle") {
                    ArticleTitle = <RunComponent els={child.children} />;
                } else if (child.tag === "ArticleCaption") {
                    ArticleCaption = <RunComponent els={child.children} />;
                }
                else { assertNever(child); }
            }
            if (ArticleTitle || ArticleCaption) {
                blocks.push(
                    <div
                        style={{ marginLeft: `${indent}em` }}
                        key={-2}
                    >
                        {ArticleTitle}{ArticleCaption}
                    </div>
                );
            }

        } else if (el.tag === "TOCAppdxTableLabel") {
            throw new NotImplementedError(el.tag);

        } else {
            let TocItemTitle: JSX.Element | null = null;
            let ArticleRange: JSX.Element | null = null;
            let TOCItems: (std.TOCChapter | std.TOCSection | std.TOCSubsection | std.TOCDivision | std.TOCArticle)[] = [];
            for (let i = 0; i < el.children.length; i++) {
                const child = el.children[i];

                if (child.tag === "PartTitle" || child.tag === "ChapterTitle" || child.tag === "SectionTitle" || child.tag === "SubsectionTitle" || child.tag === "DivisionTitle" || child.tag === "SupplProvisionLabel") {
                    TocItemTitle = <RunComponent els={child.children} />;

                } else if (child.tag === "ArticleRange") {
                    ArticleRange = <RunComponent els={child.children} />;

                } else if (child.tag === "TOCChapter" || child.tag === "TOCSection" || child.tag === "TOCSubsection" || child.tag === "TOCDivision" || child.tag === "TOCArticle") {
                    TOCItems.push(child);

                }
                else { assertNever(child); }
            }
            if (TocItemTitle || ArticleRange) {
                blocks.push(
                    <div
                        style={{ marginLeft: `${indent}em` }}
                        key={-1}
                    >
                        {TocItemTitle}{ArticleRange}
                    </div>
                );
            }
            for (let i = 0; i < TOCItems.length; i++) {
                const TOCItem = TOCItems[i];
                blocks.push(<TOCItemComponent el={TOCItem} indent={indent + 1} key={i} />); /* >>>> INDENT >>>> */
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

class AppdxTableComponent extends React.Component<{ el: std.AppdxTable, indent: number }> {
    render() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        let AppdxTableTitle: JSX.Element | null = null;
        let RelatedArticleNum: JSX.Element | null = null;
        let ChildItems: (std.TableStruct | std.Item | std.Remarks)[] = [];
        for (let child of el.children) {

            if (child.tag === "AppdxTableTitle") {
                AppdxTableTitle = <RunComponent els={child.children} />;

            } else if (child.tag === "RelatedArticleNum") {
                RelatedArticleNum = <RunComponent els={child.children} />;

            } else {
                ChildItems.push(child);
            }
        }

        if (AppdxTableTitle || RelatedArticleNum) {
            blocks.push(
                <AppdxTableTitleDiv key={-1}>
                    {AppdxTableTitle}{RelatedArticleNum}
                </AppdxTableTitleDiv>
            );
        }

        for (let i = 0; i < ChildItems.length; i++) {
            const child = ChildItems[i];
            if (child.tag === "TableStruct") {
                blocks.push(<TableStructComponent el={child} indent={indent + 1} key={i} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "Item") {
                blocks.push(<ParagraphItemComponent el={child} indent={indent + 1} key={i} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "Remarks") {
                blocks.push(<RemarksComponent el={child} indent={indent + 1} key={i} />); /* >>>> INDENT >>>> */

            }
            else { assertNever(child); }
        }

        return (
            <AppdxTableDiv>
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

class AppdxStyleComponent extends React.Component<{ el: std.AppdxStyle, indent: number }> {
    render() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        let AppdxStyleTitle: JSX.Element | null = null;
        let RelatedArticleNum: JSX.Element | null = null;
        let ChildItems: (std.StyleStruct | std.Item | std.Remarks)[] = [];
        for (let child of el.children) {

            if (child.tag === "AppdxStyleTitle") {
                AppdxStyleTitle = <RunComponent els={child.children} />;

            } else if (child.tag === "RelatedArticleNum") {
                RelatedArticleNum = <RunComponent els={child.children} />;

            } else {
                ChildItems.push(child);
            }
        }

        if (AppdxStyleTitle || RelatedArticleNum) {
            blocks.push(
                <AppdxStyleTitleDiv key={-1}>
                    {AppdxStyleTitle}{RelatedArticleNum}
                </AppdxStyleTitleDiv>
            );
        }

        for (let i = 0; i < ChildItems.length; i++) {
            const child = ChildItems[i];
            if (child.tag === "StyleStruct") {
                blocks.push(<StyleStructComponent el={child} indent={indent + 1} key={i} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "Item") {
                blocks.push(<ParagraphItemComponent el={child} indent={indent + 1} key={i} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "Remarks") {
                blocks.push(<RemarksComponent el={child} indent={indent + 1} key={i} />); /* >>>> INDENT >>>> */

            }
            else { assertNever(child); }
        }

        return (
            <AppdxStyleDiv>
                {blocks}
            </AppdxStyleDiv>
        );
    }
}


const ArticleGroupTitleDiv = styled.div`
    clear: both;
    font-weight: bold;
    padding-top: 1em;
`;

class SupplProvisionComponent extends React.Component<{ el: std.SupplProvision, indent: number }> {
    render() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        let SupplProvisionLabel: JSX.Element | null = null;
        let ChildItems: (std.Chapter | std.Article | std.Paragraph | std.SupplProvisionAppdxTable | std.SupplProvisionAppdxStyle | std.SupplProvisionAppdx)[] = [];
        for (let child of el.children) {

            if (child.tag === "SupplProvisionLabel") {
                SupplProvisionLabel = <RunComponent els={child.children} />;

            } else {
                ChildItems.push(child);
            }
        }

        if (SupplProvisionLabel) {
            let Extract = el.attr.Extract == "true" ? `${MARGIN}抄` : "";
            let AmendLawNum = el.attr.AmendLawNum ? `（${el.attr.AmendLawNum}）` : "";
            blocks.push(
                <ArticleGroupTitleDiv style={{ marginLeft: `${indent + 3}em` }} key={-1}>
                    {SupplProvisionLabel}{AmendLawNum}{Extract}
                </ArticleGroupTitleDiv>
            );
        }

        for (let i = 0; i < ChildItems.length; i++) {
            const child = ChildItems[i];
            if (child.tag === "Article") {
                blocks.push(<ArticleComponent el={child} indent={indent} key={i} />);

            } else if (child.tag === "Paragraph") {
                blocks.push(<ParagraphItemComponent el={child} indent={indent} key={i} />);

            } else if (child.tag === "Chapter") {
                blocks.push(<ArticleGroupComponent el={child} indent={indent} key={i} />);

            } else if (child.tag === "SupplProvisionAppdxTable") {
                throw new NotImplementedError(child.tag);

            } else if (child.tag === "SupplProvisionAppdxStyle") {
                throw new NotImplementedError(child.tag);

            } else if (child.tag === "SupplProvisionAppdx") {
                throw new NotImplementedError(child.tag);

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


class ArticleGroupComponent extends React.Component<{ el: std.MainProvision | std.Part | std.Chapter | std.Section | std.Subsection | std.Division, indent: number }> {
    render() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        let ArticleGroupTitle: JSX.Element | null = null;
        let ChildItems: (std.Part | std.Chapter | std.Section | std.Subsection | std.Division | std.Article | std.Paragraph)[] = [];
        for (let child of el.children) {

            if (child.tag === "PartTitle" || child.tag === "ChapterTitle" || child.tag === "SectionTitle" || child.tag === "SubsectionTitle" || child.tag === "DivisionTitle") {
                ArticleGroupTitle = <RunComponent els={child.children} />;

            } else {
                ChildItems.push(child);
            }
        }

        if (ArticleGroupTitle) {
            let titleIndent =
                el.tag === "Part"
                    ? 2
                    : el.tag === "Chapter"
                        ? 3
                        : el.tag === "Section"
                            ? 4
                            : el.tag === "Subsection"
                                ? 5
                                : el.tag === "Division"
                                    ? 6
                                    : el.tag === "MainProvision"
                                        ? 1
                                        : assertNever(el);
            blocks.push(
                <ArticleGroupTitleDiv style={{ marginLeft: `${indent + titleIndent}em` }} key={-1}>
                    {ArticleGroupTitle}
                </ArticleGroupTitleDiv>
            );
        }

        for (let i = 0; i < ChildItems.length; i++) {
            const child = ChildItems[i];
            if (child.tag === "Article") {
                blocks.push(<ArticleComponent el={child} indent={indent} key={i} />);

            } else if (child.tag === "Paragraph") {
                blocks.push(<ParagraphItemComponent el={child} indent={indent} key={i} />);

            } else {
                blocks.push(<ArticleGroupComponent el={child} indent={indent} key={i} />);
            }
        }

        return (
            <div>
                {blocks}
            </div>
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

class ArticleComponent extends React.Component<{ el: std.Article, indent: number }> {
    render() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        let ArticleCaption: JSX.Element | null = null;
        let ArticleTitle: JSX.Element | null = null;
        let Paragraphs: std.Paragraph[] = [];
        for (let child of el.children) {

            if (child.tag === "ArticleCaption") {
                ArticleCaption = <RunComponent els={child.children} />;

            } else if (child.tag === "ArticleTitle") {
                ArticleTitle = <RunComponent els={child.children} />;

            } else if (child.tag === "Paragraph") {
                Paragraphs.push(child);

            } else if (child.tag === "SupplNote") {
                throw new NotImplementedError(child.tag);

            }
            else { assertNever(child); }
        }

        if (ArticleCaption) {
            blocks.push(
                <ArticleCaptionDiv style={{ marginLeft: `${indent + 1}em` }} key={-1}>
                    {ArticleCaption}
                </ArticleCaptionDiv>
            );
        }

        for (let i = 0; i < Paragraphs.length; i++) {
            let Paragraph = Paragraphs[i];
            blocks.push(
                <ParagraphItemComponent
                    el={Paragraph}
                    indent={indent}
                    ArticleCaption={(i === 0 && ArticleTitle) ? ArticleTitle : undefined}
                    key={i}
                />
            );
        }

        return (
            <ArticleDiv>
                {blocks}
            </ArticleDiv>
        );
    }
}




const ParagraphCaptionDiv = styled.div`
    padding-left: 1em;
    text-indent: -1em;
`;

class ParagraphItemComponent extends React.Component<{ el: std.Paragraph | std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10, indent: number, ArticleCaption?: JSX.Element }> {
    render() {
        const el = this.props.el;
        const indent = this.props.indent;
        const ArticleCaption = this.props.ArticleCaption;

        let blocks: JSX.Element[] = [];

        let ParagraphCaption: JSX.Element | null = null;
        let ParagraphItemTitle: JSX.Element | null = null;
        let ParagraphItemSentence: std.ParagraphSentence | std.ItemSentence | std.Subitem1Sentence | std.Subitem2Sentence | std.Subitem3Sentence | std.Subitem4Sentence | std.Subitem5Sentence | std.Subitem6Sentence | std.Subitem7Sentence | std.Subitem8Sentence | std.Subitem9Sentence | std.Subitem10Sentence | undefined = undefined;
        let Children: (std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10 | std.AmendProvision | std.Class | std.TableStruct | std.FigStruct | std.StyleStruct | std.List)[] = [];
        for (let child of el.children) {

            if (child.tag === "ParagraphCaption") {
                ParagraphCaption = <RunComponent els={child.children} />;

            } else if (child.tag === "ParagraphNum" || child.tag === "ItemTitle" || child.tag ===
                "Subitem1Title" || child.tag === "Subitem2Title" || child.tag === "Subitem3Title" || child.tag === "Subitem4Title" || child.tag ===
                "Subitem5Title" || child.tag === "Subitem6Title" || child.tag === "Subitem7Title" || child.tag === "Subitem8Title" || child.tag ===
                "Subitem9Title" || child.tag === "Subitem10Title") {
                ParagraphItemTitle = <RunComponent els={child.children} />;

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
                <ParagraphCaptionDiv style={{ marginLeft: `${indent + 1}em` }} key={-2}>
                    {ParagraphCaption}
                </ParagraphCaptionDiv>
            );
        }

        let Title = <span style={{ fontWeight: "bold" }}>{ParagraphItemTitle}{ArticleCaption}</span>;
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
                blocks.push(<ParagraphItemComponent el={child} indent={indent + 1} key={i} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "TableStruct") {
                blocks.push(<TableStructComponent el={child} indent={indent + 1} key={i} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "FigStruct") {
                blocks.push(<FigStructComponent el={child} indent={indent + 1} key={i} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "StyleStruct") {
                blocks.push(<StyleStructComponent el={child} indent={indent + 1} key={i} />); /* >>>> INDENT >>>> */

            } else if (child.tag === "List") {
                blocks.push(<ListComponent el={child} indent={indent + 2} key={i} />); /* >>>> INDENT ++++ INDENT >>>> */

            } else if (child.tag === "AmendProvision" || child.tag === "Class") {
                throw new NotImplementedError(child.tag);

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


class ListComponent extends React.Component<{ el: std.List | std.Sublist1 | std.Sublist2 | std.Sublist3, indent: number }> {
    render() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];

            if (child.tag === "ListSentence" || child.tag === "Sublist1Sentence" || child.tag === "Sublist2Sentence" || child.tag === "Sublist3Sentence") {
                blocks.push(<BlockSentenceComponent els={child.children} indent={indent} key={i} />);

            } else if (child.tag === "Sublist1" || child.tag === "Sublist2" || child.tag === "Sublist3") {
                blocks.push(<ListComponent el={child} indent={indent + 2} key={i} />); /* >>>> INDENT ++++ INDENT >>>> */

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



class TableStructComponent extends React.Component<{ el: std.TableStruct, indent: number }> {
    render() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];

            if (child.tag === "TableStructTitle") {
                blocks.push(
                    <div key={i}>
                        <RunComponent els={child.children} />
                    </div>
                );

            } else if (child.tag === "Table") {
                blocks.push(<TableComponent el={child} indent={indent} key={i} />);

            } else if (child.tag === "Remarks") {
                blocks.push(<RemarksComponent el={child} indent={indent} key={i} />);

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

class TableComponent extends React.Component<{ el: std.Table, indent: number }> {
    render() {
        const el = this.props.el;
        const indent = this.props.indent;

        let rows: JSX.Element[] = [];

        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];

            if (child.tag === "TableRow" || child.tag === "TableHeaderRow") {
                rows.push(<TableRowComponent el={child} indent={indent} key={i} />);

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




class RemarksComponent extends React.Component<{ el: std.Remarks, indent: number }> {
    render() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        let RemarksLabel: JSX.Element | null = null;
        let ChildItems: (std.Item | std.Sentence)[] = [];
        for (let child of el.children) {

            if (child.tag === "RemarksLabel") {
                RemarksLabel = <RunComponent els={child.children} style={{ fontWeight: "bold" }} />;

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
                        Title={(i === 0 && RemarksLabel) || undefined}
                        indent={0}
                        key={i}
                    />
                );

            } else if (child.tag === "Item") {
                if (i == 0) {
                    blocks.push(
                        <div key={i}>
                            {RemarksLabel}
                        </div>
                    );
                }
                blocks.push(<ParagraphItemComponent el={child} indent={1} key={i} />);

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


class TableRowComponent extends React.Component<{ el: std.TableRow | std.TableHeaderRow, indent: number }> {
    render() {
        const el = this.props.el;
        const indent = this.props.indent;

        let columns: JSX.Element[] = [];

        for (let i = 0; i < el.children.length; i++) {
            let child = el.children[i];

            if (child.tag === "TableColumn" || child.tag === "TableHeaderColumn") {
                columns.push(<TableColumnComponent el={child} indent={1} key={i} />);

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

class TableColumnComponent extends React.Component<{ el: std.TableColumn | std.TableHeaderColumn, indent: number }> {
    render() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        if (el.tag === "TableHeaderColumn") {
            blocks.push(
                <div key={-1}>
                    <RunComponent els={el.children} />
                </div>
            );

        } else if (el.tag === "TableColumn") {
            for (let i = 0; i < el.children.length; i++) {
                let child = el.children[i];

                if (child.tag === "Sentence" || child.tag === "Column") {
                    blocks.push(<BlockSentenceComponent els={[child]} indent={0} key={i} />);

                } else if (child.tag === "FigStruct") {
                    blocks.push(<FigStructComponent el={child} indent={0} key={i} />);

                } else if (child.tag === "Part" || child.tag === "Chapter" || child.tag === "Section" || child.tag === "Subsection" || child.tag === "Division" || child.tag === "Article" || child.tag === "Paragraph" || child.tag === "Item" || child.tag === "Subitem1" || child.tag === "Subitem2" || child.tag === "Subitem3" || child.tag === "Subitem4" || child.tag === "Subitem5" || child.tag === "Subitem6" || child.tag === "Subitem7" || child.tag === "Subitem8" || child.tag === "Subitem9" || child.tag === "Subitem10" || child.tag === "Remarks") {
                    throw new NotImplementedError(child.tag);
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


class StyleStructComponent extends React.Component<{ el: std.StyleStruct, indent: number }> {
    render() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];

            if (child.tag === "StyleStructTitle") {
                blocks.push(
                    <div key={i}>
                        <RunComponent els={child.children} />
                    </div>
                );

            } else if (child.tag === "Style") {

                for (let subchild of child.children) {
                    if (isString(subchild)) {
                        throw new NotImplementedError("string");

                    } else if (std.isTable(subchild)) {
                        blocks.push(<TableComponent el={subchild} indent={indent} key={i} />);

                    } else if (std.isFig(subchild)) {
                        blocks.push(
                            <div key={i}>
                                <FigRunComponent el={subchild} />
                            </div>
                        );

                    } else if (std.isList(subchild)) {
                        blocks.push(<ListComponent el={subchild} indent={indent + 2} key={i} />); /* >>>> INDENT ++++ INDENT >>>> */

                    } else {
                        throw new NotImplementedError(subchild.tag);

                    }
                }

            } else if (child.tag === "Remarks") {
                blocks.push(<RemarksComponent el={child} indent={indent} key={i} />);

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


class FigStructComponent extends React.Component<{ el: std.FigStruct, indent: number }> {
    render() {
        const el = this.props.el;
        const indent = this.props.indent;

        let blocks: JSX.Element[] = [];

        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];

            if (child.tag === "FigStructTitle") {
                blocks.push(
                    <div key={i}>
                        <RunComponent els={child.children} />
                    </div>
                );

            } else if (child.tag === "Fig") {
                blocks.push(
                    <div key={i}>
                        <FigRunComponent el={child} />
                    </div>
                );

            } else if (child.tag === "Remarks") {
                blocks.push(<RemarksComponent el={child} indent={indent} key={i} />);

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


class FigRunComponent extends React.Component<{ el: std.Fig }> {
    render() {
        const el = this.props.el;

        if (el.children.length > 0) {
            throw new NotImplementedError(el.outerXML());
        }

        return <span>[{el.attr.src}]</span>;
    }
}



const FirstColumnSpan = styled.span`
    color: rgb(121, 113, 0);
`;

class BlockSentenceComponent extends React.Component<{ els: (std.Sentence | std.Column | std.Table)[], indent: number, Title?: JSX.Element, style?: React.CSSProperties }> {
    render() {
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
            <div style={Object.assign({}, { marginLeft: `${indent}em` }, style)}>
                {runs}
            </div>
        );
    }
}



class RunComponent extends React.Component<{ els: (string | std.Line | std.QuoteStruct | std.ArithFormula | std.Ruby | std.Sup | std.Sub | std.__EL)[], style?: React.CSSProperties }> {
    render() {
        const els = this.props.els;
        const style = this.props.style;

        let runs: JSX.Element[] = [];


        for (let i = 0; i < els.length; i++) {
            const el = els[i];

            if (isString(el)) {
                runs.push(<span key={i}>{el}</span>);

            } else if (el.isControl) {
                runs.push(<span key={i}>{el.text}</span>);

            } else if (el.tag === "Ruby" || el.tag === "Sub" || el.tag === "Sup" || el.tag === "QuoteStruct") {
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
