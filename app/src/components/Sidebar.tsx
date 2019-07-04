import * as React from "react";
import styled from 'styled-components';
import * as std from "../../../core/src/std_law"
import { assertNever, EL } from "../../../core/src/util"
import { Dispatchers } from '../containers/LawtextAppPageContainer';
import { LawtextAppPageState, RouteState } from '../states';
import { inspect, isString } from "util";


type Props = LawtextAppPageState & Dispatchers & RouteState;



const SidebarH1 = styled.h1`
    text-align: center;
    margin-top: 1rem;
    color: rgb(75, 75, 75);
`;

const SidebarHeadDiv = styled.div`
    flex-grow: 0;
    margin-bottom: 1rem;
`;

class SidebarHead extends React.Component<Props, { lawSearchKey: string }> {

    public state = { lawSearchKey: "" };

    constructor(props: Props) {
        super(props);
        this.state = { lawSearchKey: props.lawSearchKey || "" };
    }

    public handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        this.props.history.push(`/${this.state.lawSearchKey}`);
    }

    public render() {

        const formOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
            this.handleSearchSubmit(e);
        }

        const lawSearchKeyOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({ lawSearchKey: e.target.value });
        }

        const downloadLawtext = () => {
            if (this.props.law) {
                this.props.downloadLawtext(this.props.law);
            }
        }

        const downloadXml = () => {
            if (this.props.law) {
                this.props.downloadXml(this.props.law);
            }
        }

        const downloadDocxAll = () => {
            if (this.props.law) {
                this.props.downloadDocx(this.props.law);
            }
        }

        const downloadDocxSelection = () => {
            if (this.props.law) {
                this.props.downloadDocx(this.props.law, true);
            }
        }

        return (
            <SidebarHeadDiv>
                <div className="container-fluid">
                    <SidebarH1>
                        <a href={location.protocol + '//' + location.host + location.pathname + location.search}
                            style={{ color: "inherit" }}>Lawtext</a>
                    </SidebarH1>

                    {!this.props.loadingLaw &&

                        <div className="list-group" style={{ textAlign: "center" }}>
                            <button
                                onClick={this.props.openFile}
                                className="list-group-item list-group-item-sm list-group-item-action"
                                style={{ fontSize: "0.8em", padding: "0.5em" }}
                            >
                                法令ファイルを開く
                            </button>

                            <form
                                className="list-group-item list-group-item-sm"
                                style={{ fontSize: "0.8em", padding: 0 }}
                                onSubmit={formOnSubmit}
                            >
                                <div className="input-group">
                                    <input
                                        name="lawSearchKey"
                                        onChange={lawSearchKeyOnChange}
                                        className="form-control form-control-sm search-law-textbox"
                                        style={{
                                            border: "none",
                                            padding: "0.45em",
                                            borderRadius: 0,
                                            borderBottomLeftRadius: ".25rem",
                                        }}
                                        placeholder="法令名か法令番号を検索" aria-label="法令名か法令番号を検索"
                                        value={this.state.lawSearchKey || ""}
                                    />
                                    <span className="input-group-btn">
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            type="submit"
                                            style={{ borderRadius: 0, borderBottomRightRadius: ".25rem" }}
                                        >
                                            検索
                                        </button>
                                    </span>
                                </div>
                            </form>

                        </div>

                    }

                    {this.props.law &&
                        <div style={{ marginTop: "0.5rem", display: "flex" }}>
                            <span
                                style={{
                                    fontSize: ".875rem",
                                    whiteSpace: "nowrap",
                                    paddingTop: "5px",
                                }}
                            >
                                保存：
                            </span>
                            <div>
                                <span className="btn-group btn-group-sm">
                                    <button
                                        onClick={downloadDocxAll}
                                        className="btn btn-outline-primary"
                                    >
                                        Word
                                    </button>
                                    <button
                                        onClick={downloadLawtext}
                                        className="btn btn-outline-primary"
                                    >
                                        Lawtext
                                    </button>
                                    <button
                                        onClick={downloadXml}
                                        className="btn btn-outline-primary"
                                    >
                                        法令XML
                                    </button>
                                </span>
                                <span className="btn-group btn-group-sm" style={{ marginTop: "0.2rem" }}>
                                    <button
                                        onClick={downloadDocxSelection}
                                        className="btn btn-outline-primary"
                                        style={{ padding: "0 8px" }}
                                    >
                                        Word（選択した条のみ）
                                    </button>
                                </span>
                            </div >
                        </div >
                    }

                </div >
            </SidebarHeadDiv >
        );
    }
}



const SidebarBodyDiv = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
`;

const TOCItemDiv = styled.div`
    text-indent: -1em;
    overflow-x: hidden;
    overflow-y: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    &:hover {
        background-color: rgba(255, 255, 255, .8);
    }
`;

const LawNavDiv = styled.div`
    flex-grow: 1;
    flex-basis: 0;
    overflow-y: auto;
    border-top: 1px solid #d6d6d6;
    border-bottom: 1px solid #d6d6d6;
    padding: 0.4rem 0;
    font-size: 0.75em;
`;

class SidebarBody extends React.Component<Props> {
    public shouldComponentUpdate(nextProps: Props) {
        return this.props.law !== nextProps.law;
    }

    public render() {
        return (
            <SidebarBodyDiv>
                {this.renderNavBlock()}
            </SidebarBodyDiv>
        );
    }

    protected processLawBody(lawBody: std.LawBody) {
        const list: JSX.Element[] = [];

        for (const el of lawBody.children) {
            if (el.tag === "LawTitle") {
                list.push(...this.processLawTitle(el, 0));
            } else if (el.tag === "EnactStatement") {
                list.push(...this.processEnactStatement(el, 0));
            } else if (el.tag === "TOC") {
                list.push(...this.processTOC(el, 0));
            } else if (el.tag === "Preamble") {
                list.push(...this.processPreamble(el, 0));
            } else if (el.tag === "MainProvision") {
                list.push(...this.processArticleGroup(el, 0));
            } else if (el.tag === "SupplProvision") {
                list.push(...this.processSupplProvision(el, 0));
            } else if (el.tag === "AppdxTable") {
                list.push(...this.processAppdxTable(el, 0));
            } else if (el.tag === "AppdxStyle") {
                list.push(...this.processAppdxStyle(el, 0));
            } else if (el.tag === "AppdxFig") {
                list.push(...this.processAppdxFig(el, 0));
            } else if (el.tag === "AppdxNote") {
                list.push(...this.processAppdxNote(el, 0));
            } else if (el.tag === "AppdxFormat") {
                list.push(...this.processAppdxFormat(el, 0));
            } else if (el.tag === "Appdx") {
                list.push(...this.processAppdx(el, 0));
            } else {
                assertNever(el);
            }
        };

        return (
            <div>
                {list}
            </div>
        )
    }

    protected processLawTitle(lawTitle: std.LawTitle, indent: number) {
        const list: JSX.Element[] = [];

        const onClick = () => {
            this.props.scrollLaw(lawTitle.id.toString());
        }

        list.push(
            <TOCItemDiv
                key={lawTitle.id}
                style={{
                    paddingLeft: (indent + 2) + "em",
                }}
                onClick={onClick}
            >
                {lawTitle.text}
            </TOCItemDiv>
        );

        return list;
    }

    protected processEnactStatement(preamble: std.EnactStatement, indent: number) {
        const list: JSX.Element[] = [];

        const onClick = () => {
            this.props.scrollLaw(preamble.id.toString());
        }

        list.push(
            <TOCItemDiv
                key={preamble.id}
                style={{
                    paddingLeft: (indent + 2) + "em",
                }}
                onClick={onClick}
            >
                制定文
            </TOCItemDiv>
        );

        return list;
    }

    protected processPreamble(preamble: std.Preamble, indent: number) {
        const list: JSX.Element[] = [];

        const onClick = () => {
            this.props.scrollLaw(preamble.id.toString());
        }

        list.push(
            <TOCItemDiv
                key={preamble.id}
                style={{
                    paddingLeft: (indent + 2) + "em",
                }}
                onClick={onClick}
            >
                前文
            </TOCItemDiv>
        );

        return list;
    }

    protected processTOC(toc: std.TOC, indent: number) {
        const list: JSX.Element[] = [];

        const tocLabel = toc.children.find((el) => el.tag === "TOCLabel") as std.TOCLabel | undefined;

        const onClick = () => {
            this.props.scrollLaw(toc.id.toString());
        }

        if (tocLabel) {
            list.push(
                <TOCItemDiv
                    key={toc.id}
                    style={{
                        paddingLeft: (indent + 2) + "em",
                    }}
                    onClick={onClick}
                >
                    {tocLabel.text}
                </TOCItemDiv>
            );
        }

        return list;
    }

    protected processArticleGroup(
        articleGroup: std.MainProvision | std.Part | std.Chapter | std.Section | std.Subsection | std.Division,
        indent: number,
    ) {
        const list: JSX.Element[] = [];

        for (const el of articleGroup.children) {
            if (el.tag === "PartTitle" || el.tag === "ChapterTitle" || el.tag === "SectionTitle" || el.tag === "SubsectionTitle" || el.tag === "DivisionTitle" || el.tag as any === "AppdxStyleTitle") {

                const onClick = () => {
                    this.props.scrollLaw(articleGroup.id.toString());
                }

                list.push(
                    <TOCItemDiv
                        key={el.id}
                        style={{
                            paddingLeft: (indent + 2) + "em",
                        }}
                        onClick={onClick}
                        title={el.text}
                    >
                        {el.text}
                    </TOCItemDiv>
                );

            }
        }

        for (const el of articleGroup.children) {
            if (el.tag === "Part" || el.tag === "Chapter" || el.tag === "Section" || el.tag === "Subsection" || el.tag === "Division") {
                list.push(...this.processArticleGroup(el, articleGroup.tag === "MainProvision" ? indent : indent + 1));

            } else if (el.tag === "Article") {
                list.push(...this.processArticle(el, articleGroup.tag === "MainProvision" ? indent : indent + 1));

            } else if (el.tag === "Paragraph" || el.tag === "PartTitle" || el.tag === "ChapterTitle" || el.tag === "SectionTitle" || el.tag === "SubsectionTitle" || el.tag === "DivisionTitle") {
                //

            } else {
                console.error(`unexpected element! ${inspect(el)}`);
                list.push(...this.processAnyLaw(el, indent));

            }
        }

        return list;
    }

    protected processArticle(article: std.Article, indent: number) {
        const list: JSX.Element[] = [];

        const articleCaption = article.children.find((el) => el.tag === "ArticleCaption") as std.ArticleCaption | undefined;
        const articleTitle = article.children.find((el) => el.tag === "ArticleTitle") as std.ArticleCaption | undefined;

        if (articleTitle) {
            const name = articleTitle.text;
            let text = name;
            if (articleCaption) {
                const appendText = articleCaption.text;
                text += (appendText[0] === "（" ? "" : "　") + appendText;
            }

            const onClick = () => {
                this.props.scrollLaw(article.id.toString());
            }

            list.push(
                <TOCItemDiv
                    key={article.id}
                    style={{
                        paddingLeft: (indent + 2) + "em",
                    }}
                    onClick={onClick}
                    title={text}
                >
                    {text}
                </TOCItemDiv>
            );
        }

        return list;
    }

    protected processSupplProvision(supplProvision: std.SupplProvision, indent: number) {
        const list: JSX.Element[] = [];

        const supplProvisionLabel = supplProvision.children.find((el) => el.tag === "SupplProvisionLabel") as std.SupplProvisionLabel | undefined;

        if (supplProvisionLabel) {
            const name = supplProvisionLabel.text;
            const amendLawNum = supplProvision.attr.AmendLawNum || "";
            const text = (name + (amendLawNum ? ("（" + amendLawNum + "）") : "")).replace(/[\s　]+/, "");

            const onClick = () => {
                this.props.scrollLaw(supplProvision.id.toString());
            }

            list.push(
                <TOCItemDiv
                    key={supplProvision.id}
                    style={{
                        paddingLeft: (indent + 2) + "em",
                    }}
                    onClick={onClick}
                    title={text}
                >
                    {text}
                </TOCItemDiv>
            );
        }

        return list;
    }

    protected processAppdxTable(appdxTable: std.AppdxTable, indent: number) {
        const list: JSX.Element[] = [];

        const appdxTableTitle = appdxTable.children.find((el) => el.tag === "AppdxTableTitle") as std.AppdxTableTitle | undefined;

        if (appdxTableTitle) {
            const onClick = () => {
                this.props.scrollLaw(appdxTable.id.toString());
            }

            list.push(
                <TOCItemDiv
                    key={appdxTable.id}
                    style={{
                        paddingLeft: (indent + 2) + "em",
                    }}
                    onClick={onClick}
                    title={appdxTableTitle.text}
                >
                    {appdxTableTitle.text}
                </TOCItemDiv>
            );
        }

        return list;
    }

    protected processAppdxStyle(appdxStyle: std.AppdxStyle, indent: number) {
        const list: JSX.Element[] = [];

        const appdxStyleTitle = appdxStyle.children.find((el) => el.tag === "AppdxStyleTitle") as std.AppdxStyleTitle | undefined;

        if (appdxStyleTitle) {
            const onClick = () => {
                this.props.scrollLaw(appdxStyle.id.toString());
            }
            list.push(
                <TOCItemDiv
                    key={appdxStyle.id}
                    style={{
                        paddingLeft: (indent + 2) + "em",
                    }}
                    onClick={onClick}
                    title={appdxStyleTitle.text}
                >
                    {appdxStyleTitle.text}
                </TOCItemDiv>
            );
        }

        return list;
    }

    protected processAppdxFig(appdxFig: std.AppdxFig, indent: number) {
        const list: JSX.Element[] = [];

        const AppdxFigTitle = appdxFig.children.find((el) => el.tag === "AppdxFigTitle") as std.AppdxFigTitle | undefined;

        if (AppdxFigTitle) {
            const onClick = () => {
                this.props.scrollLaw(appdxFig.id.toString());
            }
            list.push(
                <TOCItemDiv
                    key={appdxFig.id}
                    style={{
                        paddingLeft: (indent + 2) + "em",
                    }}
                    onClick={onClick}
                    title={AppdxFigTitle.text}
                >
                    {AppdxFigTitle.text}
                </TOCItemDiv>
            );
        }

        return list;
    }

    protected processAppdxFormat(appdxFig: std.AppdxFormat, indent: number) {
        const list: JSX.Element[] = [];

        const appdxFormatTitle = appdxFig.children.find((el) => el.tag === "AppdxFormatTitle") as std.AppdxFormatTitle | undefined;

        if (appdxFormatTitle) {
            const onClick = () => {
                this.props.scrollLaw(appdxFig.id.toString());
            }
            list.push(
                <TOCItemDiv
                    key={appdxFig.id}
                    style={{
                        paddingLeft: (indent + 2) + "em",
                    }}
                    onClick={onClick}
                    title={appdxFormatTitle.text}
                >
                    {appdxFormatTitle.text}
                </TOCItemDiv>
            );
        }

        return list;
    }

    protected processAppdxNote(appdxFig: std.AppdxNote, indent: number) {
        const list: JSX.Element[] = [];

        const appdxNoteTitle = appdxFig.children.find((el) => el.tag === "AppdxNoteTitle") as std.AppdxNoteTitle | undefined;

        if (appdxNoteTitle) {
            const onClick = () => {
                this.props.scrollLaw(appdxFig.id.toString());
            }
            list.push(
                <TOCItemDiv
                    key={appdxFig.id}
                    style={{
                        paddingLeft: (indent + 2) + "em",
                    }}
                    onClick={onClick}
                    title={appdxNoteTitle.text}
                >
                    {appdxNoteTitle.text}
                </TOCItemDiv>
            );
        }

        return list;
    }


    protected processAppdx(appdxFig: std.Appdx, indent: number) {
        const list: JSX.Element[] = [];

        const ArithFormulaNum = appdxFig.children.find((el) => el.tag === "ArithFormulaNum") as std.ArithFormulaNum | undefined;

        if (ArithFormulaNum) {
            const onClick = () => {
                this.props.scrollLaw(appdxFig.id.toString());
            }
            list.push(
                <TOCItemDiv
                    key={appdxFig.id}
                    style={{
                        paddingLeft: (indent + 2) + "em",
                    }}
                    onClick={onClick}
                    title={ArithFormulaNum.text}
                >
                    {ArithFormulaNum.text}
                </TOCItemDiv>
            );
        }

        return list;
    }

    protected renderNavBlock() {
        if (this.props.law) {
            const lawBody = this.props.law.children.find((el) => el.tag === "LawBody") as std.LawBody;
            return (
                <LawNavDiv>
                    {this.processLawBody(lawBody)}
                </LawNavDiv>
            );
        }
        return null;
    }

    protected processAnyLaw(el: EL, indent: number) {
        const list: JSX.Element[] = [];

        const titleEL = el.children.find(c => !isString(c) && c.tag.includes("Title")) as EL | undefined || el;

        if (titleEL) {
            const onClick = () => {
                this.props.scrollLaw(el.id.toString());
            }
            list.push(
                <TOCItemDiv
                    key={el.id}
                    style={{
                        paddingLeft: (indent + 2) + "em",
                    }}
                    onClick={onClick}
                    title={titleEL.text}
                >
                    {titleEL.text}
                </TOCItemDiv>
            );
        }

        return list;
    }
}


const SidebarFooterDiv = styled.div`
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
`;

class SidebarFooter extends React.Component<Props> {
    public render() {
        return (
            <SidebarFooterDiv>
                <div style={{ fontSize: "0.8em", textAlign: "center", padding: "0.3em 0", color: "rgb(192, 192, 192)" }}>
                    <a href="https://github.com/yamachig/lawtext" target="_blank" style={{ marginRight: "2em" }}>
                        GitHub
                    </a>
                    &copy; 2017-{new Date().getFullYear()} yamachi
                </div >
            </SidebarFooterDiv >
        );
    }
}


const SidebarDiv = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

export class Sidebar extends React.Component<Props> {
    public render() {
        return (
            <SidebarDiv>
                <SidebarHead {...this.props} />
                <SidebarBody {...this.props} />
                <SidebarFooter {...this.props} />
            </SidebarDiv >
        );
    }
}