import * as React from "react";
import * as $ from "jquery";
import { injectGlobal, default as styled } from 'styled-components';
import AnimateHeight from 'react-animate-height';
import { Dispatchers } from '../containers/LawtextAppPageContainer';
import { LawtextAppPageState, RouteState } from '../states';
import * as std from "../../../js/src/std_law"
import { EL, assertNever, NotImplementedError } from "../../../js/src/util"
import * as analyzer from "../../../js/src/analyzer";
import EventListener from 'react-event-listener';
import { isString } from "util";
import { store } from "../store";

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
        let tocLabelText: string = "";
        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];

            if (child.tag === "TOCLabel") {

                tocLabelText = child.text;
                blocks.push(
                    <div
                        className="law-anchor"
                        data-tag={el.tag}
                        data-name={child.text}
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
            <TOCDiv
                data-toplevel_container_info={JSON.stringify({ tag: el.tag, id: tocLabelText })}
            >
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
                    data-tag={el.tag}
                    data-name={AppdxTableTitle && AppdxTableTitle.text}
                    key={-1}
                >
                    {AppdxTableTitle && <RunComponent els={AppdxTableTitle.children} />}
                    {RelatedArticleNum && <RunComponent els={RelatedArticleNum.children} />}
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

class AppdxStyleComponent extends React.Component<{ el: std.AppdxStyle, indent: number }> {
    render() {
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
                    data-tag={el.tag}
                    data-name={AppdxStyleTitle && AppdxStyleTitle.text}
                    key={-1}
                >
                    {AppdxStyleTitle && <RunComponent els={AppdxStyleTitle.children} />}
                    {RelatedArticleNum && <RunComponent els={RelatedArticleNum.children} />}
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
            <AppdxStyleDiv
                data-toplevel_container_info={JSON.stringify({ tag: el.tag, id: AppdxStyleTitle && AppdxStyleTitle.text })}
            >
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
                    key={-1}
                >
                    <RunComponent els={SupplProvisionLabel.children} />{AmendLawNum}{Extract}
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
            <div
                className="law-anchor"
                data-tag={el.tag}
                data-name={`${SupplProvisionLabel && SupplProvisionLabel.text}${el.attr.AmendLawNum || ""}`}
                data-toplevel_container_info={JSON.stringify({ tag: el.tag, id: el.attr.AmendLawNum })}
            >
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
                <ArticleGroupTitleDiv
                    className="law-anchor"
                    data-tag={el.tag}
                    data-name={ArticleGroupTitle.text}
                    style={{ marginLeft: `${indent + titleIndent}em` }}
                    key={-1}
                >
                    <RunComponent els={ArticleGroupTitle.children} />
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
            el.tag === "MainProvision" ? (
                <div data-toplevel_container_info={JSON.stringify({ tag: el.tag })}>
                    {blocks}
                </div>
            ) : (
                    <div>
                        {blocks}
                    </div>
                )
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
                    key={-1}
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
                    key={i}
                />
            );
        }

        return (
            <ArticleDiv
                className="law-anchor"
                data-tag={el.tag}
                data-name={ArticleTitle && ArticleTitle.text}
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

class ParagraphItemComponent extends React.Component<{ el: std.Paragraph | std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10, indent: number, ArticleTitle?: std.ArticleTitle }> {
    render() {
        const el = this.props.el;
        const indent = this.props.indent;
        const ArticleTitle = this.props.ArticleTitle;

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

        let Title = (
            <span style={{ fontWeight: "bold" }}>
                {ParagraphItemTitle}
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
                console.log(rb, rt);
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

class ControlRunComponent extends React.Component<{ el: std.__EL }> {
    render() {
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

class ____DeclarationComponent extends React.Component<{ el: std.__EL }> {
    render() {
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

class ____VarRefComponent extends React.Component<{ el: std.__EL }, { state: VarRefFloatState, arrowLeft: string }> {
    private refText = React.createRef<HTMLSpanElement>();
    private refWindow = React.createRef<HTMLSpanElement>();
    state = { state: VarRefFloatState.HIDDEN, arrowLeft: "0" };

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

    render() {
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




class VarRefView extends React.Component<{ el: std.__EL }> {
    render() {
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

class ____LawNumComponent extends React.Component<{ el: std.__EL }> {
    render() {
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

class __ParenthesesComponent extends React.Component<{ el: std.__EL }> {
    render() {
        const el = this.props.el;

        let blocks: JSX.Element[] = [];

        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];

            if (isString(child)) {
                throw new NotImplementedError;

            } else if (child.tag === "__PStart") {
                blocks.push(<__PStartComponent el={child as std.__EL} key={i} />);

            } else if (child.tag === "__PContent") {
                blocks.push(<__PContentComponent el={child as std.__EL} key={i} />);

            } else if (child.tag === "__PEnd") {
                blocks.push(<__PEndComponent el={child as std.__EL} key={i} />);

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

class __PStartComponent extends React.Component<{ el: std.__EL }> {
    render() {
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

class __PContentComponent extends React.Component<{ el: std.__EL }> {
    render() {
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

class __PEndComponent extends React.Component<{ el: std.__EL }> {
    render() {
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

class __MismatchStartParenthesisComponent extends React.Component<{ el: std.__EL }> {
    render() {
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

class __MismatchEndParenthesisComponent extends React.Component<{ el: std.__EL }> {
    render() {
        const el = this.props.el;
        return (
            <__MismatchEndParenthesisSpan>
                {getInnerRun(el)}
            </__MismatchEndParenthesisSpan>
        );
    }
}
