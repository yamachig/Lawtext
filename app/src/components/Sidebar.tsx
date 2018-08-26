import * as React from "react";
import styled from 'styled-components';
import { Dispatchers } from '../containers/LawtextAppPageContainer';
import { LawtextAppPageState, RouteState } from '../states';
import * as std from "../../../js/src/std_law"
import { assertNever } from "../../../js/src/util"


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

    state = { lawSearchKey: "" };

    constructor(props: Props) {
        super(props);
        this.state = { lawSearchKey: props.lawSearchKey || "" };
    }

    handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        this.props.searchLaw(this.state.lawSearchKey, this.props.history);
    }

    render() {
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
                                onSubmit={(e) => this.handleSearchSubmit(e)}
                            >
                                <div className="input-group">
                                    <input
                                        name="lawSearchKey"
                                        onChange={(event) => this.setState({ lawSearchKey: event.target.value })}
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
                                        onClick={() => this.props.downloadDocx()}
                                        className="btn btn-outline-primary"
                                    >
                                        Word
                                    </button>
                                    <button
                                        onClick={this.props.downloadLawtext}
                                        className="btn btn-outline-primary"
                                    >
                                        Lawtext
                                    </button>
                                    <button
                                        onClick={this.props.downloadXml}
                                        className="btn btn-outline-primary"
                                    >
                                        法令XML
                                    </button>
                                </span>
                                <span className="btn-group btn-group-sm" style={{ marginTop: "0.2rem" }}>
                                    <button
                                        onClick={() => this.props.downloadDocx(true)}
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

    render() {
        return (
            <SidebarBodyDiv>
                {this.renderNavBlock()}
            </SidebarBodyDiv>
        );
    }

    processLawBody(law_body: std.LawBody) {
        const list: JSX.Element[] = [];

        for (const el of law_body.children) {
            if (el.tag === "TOC") {
                list.push(...this.processTOC(el, 0));
            } else if (el.tag === "MainProvision") {
                list.push(...this.processArticleGroup(el, 0));
            } else if (el.tag === "SupplProvision") {
                list.push(...this.processSupplProvision(el, 0));
            } else if (el.tag === "AppdxTable") {
                list.push(...this.processAppdxTable(el, 0));
            } else if (el.tag === "AppdxStyle") {
                list.push(...this.processAppdxStyle(el, 0));
            } else if (el.tag === "LawTitle" || el.tag === "EnactStatement" || el.tag === "Preamble" || el.tag === "AppdxNote" || el.tag === "Appdx" || el.tag === "AppdxFig" || el.tag === "AppdxFormat") {
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

    processTOC(toc: std.TOC, indent: number) {
        const list: JSX.Element[] = [];

        const tocLabel = toc.children.find((el) => el.tag === "TOCLabel") as std.TOCLabel | undefined;

        if (tocLabel) {
            list.push(
                <TOCItemDiv
                    key={`${toc.tag}/${tocLabel.text}`}
                    className="law-link"
                    style={{
                        paddingLeft: (indent + 2) + "em",
                    }}
                    data-tag={toc.tag}
                    data-name={tocLabel.text}
                >
                    {tocLabel.text}
                </TOCItemDiv >
            );
        }

        return list;
    }

    processArticleGroup(
        article_group: std.MainProvision | std.Part | std.Chapter | std.Section | std.Subsection | std.Division,
        indent: number,
    ) {
        const list: JSX.Element[] = [];

        for (const el of article_group.children) {
            if (el.tag === "PartTitle" || el.tag === "ChapterTitle" || el.tag === "SectionTitle" || el.tag === "SubsectionTitle" || el.tag === "DivisionTitle") {
                list.push(
                    <TOCItemDiv
                        key={`${article_group.tag}/${el.text}`}
                        className="law-link"
                        style={{
                            paddingLeft: (indent + 2) + "em",
                        }}
                        data-tag={article_group.tag}
                        data-name={el.text}
                        title={el.text}
                    >
                        {el.text}
                    </TOCItemDiv>
                );

            } else if (el.tag === "Part" || el.tag === "Chapter" || el.tag === "Section" || el.tag === "Subsection" || el.tag === "Division" || el.tag === "Article" || el.tag === "Paragraph") {
            } else {
                assertNever(el);
            }
        }

        for (const el of article_group.children) {
            if (el.tag === "Part" || el.tag === "Chapter" || el.tag === "Section" || el.tag === "Subsection" || el.tag === "Division") {
                list.push(...this.processArticleGroup(el, article_group.tag === "MainProvision" ? indent : indent + 1));

            } else if (el.tag === "Article") {
                list.push(...this.processArticle(el, article_group.tag == "MainProvision" ? indent : indent + 1));

            } else if (el.tag === "Paragraph") {
            } else if (el.tag === "PartTitle" || el.tag === "ChapterTitle" || el.tag === "SectionTitle" || el.tag === "SubsectionTitle" || el.tag === "DivisionTitle") {
            } else {
                assertNever(el);
            }
        }

        return list;
    }

    processArticle(article: std.Article, indent: number) {
        const list: JSX.Element[] = [];

        const articleCaption = article.children.find((el) => el.tag === "ArticleCaption") as std.ArticleCaption | undefined;
        const articleTitle = article.children.find((el) => el.tag === "ArticleTitle") as std.ArticleCaption | undefined;

        if (articleTitle) {
            const name = articleTitle.text;
            let text = name;
            if (articleCaption) {
                let append_text = articleCaption.text;
                text += (append_text[0] == "（" ? "" : "　") + append_text;
            }

            list.push(
                <TOCItemDiv
                    key={`${article.tag}/${name}`}
                    className="law-link"
                    style={{
                        paddingLeft: (indent + 2) + "em",
                    }}
                    data-tag={article.tag}
                    data-name={name}
                    title={text}
                >
                    {text}
                </TOCItemDiv>
            );
        }

        return list;
    }

    processSupplProvision(supplProvision: std.SupplProvision, indent: number) {
        const list: JSX.Element[] = [];

        const supplProvisionLabel = supplProvision.children.find((el) => el.tag === "SupplProvisionLabel") as std.SupplProvisionLabel | undefined;

        if (supplProvisionLabel) {
            const name = supplProvisionLabel.text;
            const amendLawNum = supplProvision.attr["AmendLawNum"] || "";
            let text = (name + (amendLawNum ? ("（" + amendLawNum + "）") : "")).replace(/[\s　]+/, "");
            list.push(
                <TOCItemDiv
                    key={`${supplProvision.tag}/${name + amendLawNum}`}
                    className="law-link"
                    style={{
                        paddingLeft: (indent + 2) + "em",
                    }}
                    data-tag={supplProvision.tag}
                    data-name={name + amendLawNum}
                    title={text}
                >
                    {text}
                </TOCItemDiv>
            );
        }

        return list;
    }

    processAppdxTable(appdxTable: std.AppdxTable, indent: number) {
        const list: JSX.Element[] = [];

        const appdxTableTitle = appdxTable.children.find((el) => el.tag === "AppdxTableTitle") as std.AppdxTableTitle | undefined;

        if (appdxTableTitle) {
            list.push(
                <TOCItemDiv
                    key={`${appdxTable.tag}/${appdxTableTitle.text}`}
                    className="law-link"
                    style={{
                        paddingLeft: (indent + 2) + "em",
                    }}
                    data-tag={appdxTable.tag}
                    data-name={appdxTableTitle.text}
                    title={appdxTableTitle.text}
                >
                    {appdxTableTitle.text}
                </TOCItemDiv>
            );
        }

        return list;
    }

    processAppdxStyle(appdx_style: std.AppdxStyle, indent: number) {
        const list: JSX.Element[] = [];

        const appdxStyleTitle = appdx_style.children.find((el) => el.tag === "AppdxStyleTitle") as std.AppdxStyleTitle | undefined;

        if (appdxStyleTitle) {
            list.push(
                <TOCItemDiv
                    key={`${appdxStyleTitle.tag}/${appdxStyleTitle.text}`}
                    className="law-link"
                    style={{
                        paddingLeft: (indent + 2) + "em",
                    }}
                    data-tag={appdxStyleTitle.tag}
                    data-name={appdxStyleTitle.text}
                    title={appdxStyleTitle.text}
                >
                    {appdxStyleTitle.text}
                </TOCItemDiv>
            );
        }

        return list;
    }

    renderNavBlock() {
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
}


const SidebarFooterDiv = styled.div`
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
`;

class SidebarFooter extends React.Component<Props> {
    render() {
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
    render() {
        return (
            <SidebarDiv>
                <SidebarHead {...this.props} />
                <SidebarBody {...this.props} />
                <SidebarFooter {...this.props} />
            </SidebarDiv >
        );
    }
}