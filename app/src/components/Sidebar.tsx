import React from "react";
import styled from "styled-components";
import * as std from "lawtext/dist/src/law/std";
import { assertNever } from "lawtext/dist/src/util";
import type { EL } from "lawtext/dist/src/node/el";
import type { LawtextAppPageStateStruct } from "./LawtextAppPageState";
import { downloadDocx as origDownloadDocx, downloadLawtext, downloadXml } from "../actions/download";
import { openFile } from "@appsrc/actions/openFile";
import { scrollToLawAnchor } from "@appsrc/actions/scroll";
import type { Container } from "lawtext/dist/src/node/container";
import makePath from "lawtext/dist/src/path/v1/make";
import type { NavigateFunction } from "react-router-dom";
import getOnMessage from "../actions/getOnMessage";
import type { FigDataManagerOptions } from "lawtext/dist/src/renderer/common/docx/FigDataManager";
import useSearchInput from "./useSearchInput";


const SidebarH1 = styled.h1`
    text-align: center;
    margin-top: 1rem;
    font-size: 2.5rem;
    color: rgb(75, 75, 75);
`;

const SidebarHeadDiv = styled.div`
    flex-grow: 0;
    margin-bottom: 1rem;
`;

const SidebarHead: React.FC<LawtextAppPageStateStruct> = props => {
    const { origState, navigate, origSetState } = props;

    const {
        editingKey,
        searchInput,
        searchDropdown,
    } = useSearchInput({
        searchInputStyle: {
            border: "none",
            padding: "0.45em",
            borderRadius: 0,
            borderBottomLeftRadius: ".25rem",
        },
    });

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        navigate(`/${editingKey.replace("/", "")}`);
    };

    const downloadLawtextClick = () => {
        if (origState.law) {
            downloadLawtext(origState.law.el);
        }
    };

    const downloadXmlClick = () => {
        if (origState.law) {
            downloadXml(origState.law.el);
        }
    };

    const downloadDocx = (downloadSelection: boolean, figPDFType: FigDataManagerOptions["figPDFType"]) => {
        if (origState.law) {
            origDownloadDocx({
                lawData: origState.law,
                downloadSelection,
                figPDFType,
                onMessage: getOnMessage({ key: `download-${new Date().toISOString()}`, origSetState }).onMessage,
            });
        }
    };

    return (
        <SidebarHeadDiv>
            <div className="container-fluid">
                <SidebarH1>
                    <a href={location.protocol + "//" + location.host + location.pathname + location.search}
                        style={{ color: "inherit" }}>Lawtext</a>
                </SidebarH1>

                {!origState.loadingLaw &&

                    <div className="list-group" style={{ textAlign: "center" }}>
                        <button
                            onClick={openFile}
                            className="list-group-item  list-group-item-action"
                            style={{ fontSize: "0.8em", padding: "0.5em" }}
                        >
                            法令ファイルを開く
                        </button>

                        <form
                            className="list-group-item "
                            style={{ fontSize: "0.8em", padding: 0 }}
                            onSubmit={handleSearchSubmit}
                        >
                            <div className="input-group input-group-sm">
                                {searchInput}
                                <button
                                    className="btn btn-secondary"
                                    type="submit"
                                    style={{ borderRadius: 0, borderBottomRightRadius: ".25rem" }}
                                >
                                    検索
                                </button>
                            </div>
                            {searchDropdown}

                        </form>

                    </div>

                }

                {origState.law &&
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
                            <span className="btn-group btn-group-sm" role="group" title="Wordファイルを保存">
                                <div className="btn-group btn-group-sm" role="group">
                                    <button className="btn btn-outline-primary" onClick={() => downloadDocx(false, "render")}>Word</button>
                                    <button type="button" className="btn btn-outline-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" style={{ padding: "0 3px" }} title="Wordファイルを保存：出力方式を選択"/>
                                    <div className="dropdown-menu">
                                        <h6 className="dropdown-header">
                                            添付PDF（様式など）がある場合のWord出力方式：
                                        </h6>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => downloadDocx(false, "render")}
                                        >
                                            デフォルト：添付PDFファイルを画像化してWord出力
                                            <div className="text-muted lh-1 small" style={{ whiteSpace: "normal" }}>Wordファイルとして表示したり印刷するのに適しています。画像化に時間が掛かります。</div>
                                        </button>
                                        <div className="dropdown-divider"></div>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => downloadDocx(false, "embed")}
                                        >
                                            添付PDFファイルを埋め込んでWord出力
                                            <div className="text-muted lh-1 small" style={{ whiteSpace: "normal" }}>元のPDFのまま埋め込み、画像化を行わないため高速です。埋め込まれたPDFはダブルクリックで開けます。</div>
                                        </button>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => downloadDocx(false, "embedAndRender")}
                                        >
                                            添付PDFファイルを埋め込み＋画像化してWord出力
                                        </button>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => downloadDocx(false, "srcText")}
                                        >
                                            添付PDFファイルを含めずWord出力
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={downloadLawtextClick}
                                    className="btn btn-outline-primary"
                                >
                                    Lawtext
                                </button>
                                <button
                                    onClick={downloadXmlClick}
                                    className="btn btn-outline-primary"
                                >
                                    法令XML
                                </button>
                            </span>
                            <span className="btn-group btn-group-sm" style={{ marginTop: "0.2rem" }} title="Wordファイルを保存（選択した条のみ）">
                                <div className="btn-group btn-group-sm" role="group">
                                    <button type="button" className="btn btn-outline-primary" style={{ padding: "0 8px" }} onClick={() => downloadDocx(true, "render")}>Word（選択した条のみ）</button>
                                    <button type="button" className="btn btn-outline-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" style={{ padding: "0 8px" }} title="Wordファイルを保存（選択した条のみ）：出力方式を選択"/>
                                    <div className="dropdown-menu">
                                        <h6 className="dropdown-header">
                                            添付PDF（様式など）がある場合のWord出力方式：
                                        </h6>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => downloadDocx(true, "render")}
                                        >
                                            デフォルト：添付PDFファイルを画像化してWord出力
                                            <div className="text-muted lh-1 small" style={{ whiteSpace: "normal" }}>Wordファイルとして表示したり印刷するのに適しています。画像化に時間が掛かります。</div>
                                        </button>
                                        <div className="dropdown-divider"></div>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => downloadDocx(true, "embed")}
                                        >
                                            添付PDFファイルを埋め込んでWord出力
                                            <div className="text-muted lh-1 small" style={{ whiteSpace: "normal" }}>元のPDFのまま埋め込み、画像化を行わないため高速です。埋め込まれたPDFはダブルクリックで開けます。</div>
                                        </button>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => downloadDocx(true, "embedAndRender")}
                                        >
                                            添付PDFファイルを埋め込み＋画像化してWord出力
                                        </button>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => downloadDocx(true, "srcText")}
                                        >
                                            添付PDFファイルを含めずWord出力
                                        </button>
                                    </div>
                                </div>
                            </span>
                        </div >
                    </div >
                }

            </div >
        </SidebarHeadDiv >
    );
};


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

const TOCItemAnchor = styled.a`
    display: block;
    color: currentColor;
    text-decoration: none;
    text-indent: -1em;
    overflow-x: hidden;
    overflow-y: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    &:hover {
        background-color: rgba(255, 255, 255, .8);
        color: currentColor;
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

interface TOCItemPropsForPath {
    containers: Map<EL, Container>,
    firstPart: string,
    navigate: NavigateFunction,
}

const TOCItem: React.FC<{el: std.StdEL, indent: number, text: string} & TOCItemPropsForPath> = props => {
    const container = props.containers.get(props.el);
    const path = (container && makePath(container)) ?? null;

    if (path) {
        const onClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
            props.navigate(`/${props.firstPart}`);
            scrollToLawAnchor(props.el.id.toString());
            e.preventDefault();
            return false;
        };

        return (
            <TOCItemAnchor
                style={{
                    paddingLeft: (props.indent + 2) + "em",
                }}
                href={`#/${props.firstPart}/${path}`}
                onClick={onClick}
            >
                {props.text}
            </TOCItemAnchor>
        );

    } else {
        const onClick = () => {
            props.navigate(`/${props.firstPart}`);
            scrollToLawAnchor(props.el.id.toString());
        };

        return (
            <TOCItemDiv
                style={{
                    paddingLeft: (props.indent + 2) + "em",
                }}
                onClick={onClick}
            >
                {props.text}
            </TOCItemDiv>
        );
    }

};


const NavLaw: React.FC<{el: std.Law, indent: number} & TOCItemPropsForPath> = props => {
    return (
        <TOCItem
            {...props}
            text={props.el.children.find(std.isLawBody)?.children.find(std.isLawTitle)?.text() ?? ""}
        />
    );
};

const NavEnactStatement: React.FC<{el: std.EnactStatement, indent: number} & TOCItemPropsForPath> = props => {
    return (
        <TOCItem
            {...props}
            text={"制定文"}
        />
    );
};

const NavPreamble: React.FC<{el: std.Preamble, indent: number} & TOCItemPropsForPath> = props => {
    return (
        <TOCItem
            {...props}
            text={"前文"}
        />
    );
};

const NavTOC: React.FC<{el: std.TOC, indent: number} & TOCItemPropsForPath> = props => {
    const tocLabel = props.el.children.find((el) => el.tag === "TOCLabel") as std.TOCLabel | undefined;
    return tocLabel ? (
        <TOCItem
            {...props}
            text={tocLabel.text()}
        />
    ) : null;
};

const NavArticleGroup: React.FC<{
    el: std.MainProvision | std.Part | std.Chapter | std.Section | std.Subsection | std.Division,
    indent: number,
} & TOCItemPropsForPath> = props => {
    return (<>
        {[...props.el.children].map((el, i) => {
            if (std.isArticleGroup(el)) {
                return <NavArticleGroup
                    {...props}
                    key={i}
                    el={el}
                    indent={props.el.tag === "MainProvision" ? props.indent : props.indent + 1}
                />;

            } else if (std.isArticle(el)) {
                return <NavArticle
                    {...props}
                    key={i}
                    el={el}
                    indent={props.el.tag === "MainProvision" ? props.indent : props.indent + 1}
                />;

            } else if (el.tag === "PartTitle" || el.tag === "ChapterTitle" || el.tag === "SectionTitle" || el.tag === "SubsectionTitle" || el.tag === "DivisionTitle") {
                return (
                    <TOCItem
                        {...props}
                        key={i}
                        text={el.text()}
                    />
                );

            } else {
                console.error(`unexpected element! ${JSON.stringify(el, undefined, 2)}`);
                return <NavAnyLaw
                    {...props}
                    key={i}
                    el={el}
                    indent={props.indent}
                />;

            }
        })}
    </>);
};

const NavArticle: React.FC<{el: std.Article, indent: number} & TOCItemPropsForPath> = props => {
    const articleCaption = props.el.children.find((el) => el.tag === "ArticleCaption") as std.ArticleCaption | undefined;
    const articleTitle = props.el.children.find((el) => el.tag === "ArticleTitle") as std.ArticleCaption | undefined;

    if (articleTitle) {
        const name = articleTitle.text();
        let text = name;
        if (articleCaption) {
            const appendText = articleCaption.text();
            text += (appendText[0] === "（" ? "" : "　") + appendText;
        }
        return (
            <TOCItem
                {...props}
                text={text}
            />
        );

    } else {
        return null;
    }
};

const NavSupplProvision: React.FC<{el: std.SupplProvision, indent: number} & TOCItemPropsForPath> = props => {
    const supplProvisionLabel = props.el.children.find((el) => el.tag === "SupplProvisionLabel") as std.SupplProvisionLabel | undefined;

    if (supplProvisionLabel) {
        const name = supplProvisionLabel.text();
        const amendLawNum = props.el.attr.AmendLawNum || "";
        // eslint-disable-next-line no-irregular-whitespace
        const text = (name + (amendLawNum ? ("（" + amendLawNum + "）") : "")).replace(/[\s　]+/, "");

        return (
            <TOCItem
                {...props}
                text={text}
            />
        );

    } else {
        return null;
    }
};

const NavAppdxTable: React.FC<{el: std.AppdxTable, indent: number} & TOCItemPropsForPath> = props => {
    const appdxTableTitle = props.el.children.find((el) => el.tag === "AppdxTableTitle") as std.AppdxTableTitle | undefined;

    if (appdxTableTitle) {

        return (
            <TOCItem
                {...props}
                text={appdxTableTitle.text()}
            />
        );

    } else {
        return null;
    }
};

const NavAppdxStyle: React.FC<{el: std.AppdxStyle, indent: number} & TOCItemPropsForPath> = props => {
    const appdxStyleTitle = props.el.children.find((el) => el.tag === "AppdxStyleTitle") as std.AppdxStyleTitle | undefined;

    if (appdxStyleTitle) {

        return (
            <TOCItem
                {...props}
                text={appdxStyleTitle.text()}
            />
        );

    } else {
        return null;
    }
};

const NavAppdxFig: React.FC<{el: std.AppdxFig, indent: number} & TOCItemPropsForPath> = props => {
    const AppdxFigTitle = props.el.children.find((el) => el.tag === "AppdxFigTitle") as std.AppdxFigTitle | undefined;

    if (AppdxFigTitle) {

        return (
            <TOCItem
                {...props}
                text={AppdxFigTitle.text()}
            />
        );

    } else {
        return null;
    }
};

const NavAppdxFormat: React.FC<{el: std.AppdxFormat, indent: number} & TOCItemPropsForPath> = props => {
    const appdxFormatTitle = props.el.children.find((el) => el.tag === "AppdxFormatTitle") as std.AppdxFormatTitle | undefined;

    if (appdxFormatTitle) {

        return (
            <TOCItem
                {...props}
                text={appdxFormatTitle.text()}
            />
        );

    } else {
        return null;
    }
};

const NavAppdxNote: React.FC<{el: std.AppdxNote, indent: number} & TOCItemPropsForPath> = props => {
    const appdxNoteTitle = props.el.children.find((el) => el.tag === "AppdxNoteTitle") as std.AppdxNoteTitle | undefined;

    if (appdxNoteTitle) {

        return (
            <TOCItem
                {...props}
                text={appdxNoteTitle.text()}
            />
        );

    } else {
        return null;
    }
};


const NavAppdx: React.FC<{el: std.Appdx, indent: number} & TOCItemPropsForPath> = props => {
    const ArithFormulaNum = props.el.children.find((el) => el.tag === "ArithFormulaNum") as std.ArithFormulaNum | undefined;

    if (ArithFormulaNum) {

        return (
            <TOCItem
                {...props}
                text={ArithFormulaNum.text()}
            />
        );

    } else {
        return null;
    }
};

const NavAnyLaw: React.FC<{el: std.StdEL, indent: number} & TOCItemPropsForPath> = props => {
    const titleEL = props.el.children.find(c => typeof c !== "string" && c.tag.includes("Title")) as EL | undefined || props.el;

    if (titleEL) {

        return (
            <TOCItem
                {...props}
                text={titleEL.text()}
            />
        );

    } else {
        return null;
    }
};

const LawBody: React.FC<{el: std.LawBody} & TOCItemPropsForPath> = props => {
    return (
        <>
            {props.el.children.map((el, i) => {
                if (el.tag === "LawTitle") {
                    return null;
                } else if (el.tag === "EnactStatement") {
                    return <NavEnactStatement {...props} key={i} el={el} indent={0} />;
                } else if (el.tag === "TOC") {
                    return <NavTOC {...props} key={i} el={el} indent={0} />;
                } else if (el.tag === "Preamble") {
                    return <NavPreamble {...props} key={i} el={el} indent={0} />;
                } else if (el.tag === "MainProvision") {
                    return <NavArticleGroup {...props} key={i} el={el} indent={0} />;
                } else if (el.tag === "SupplProvision") {
                    return <NavSupplProvision {...props} key={i} el={el} indent={0} />;
                } else if (el.tag === "AppdxTable") {
                    return <NavAppdxTable {...props} key={i} el={el} indent={0} />;
                } else if (el.tag === "AppdxStyle") {
                    return <NavAppdxStyle {...props} key={i} el={el} indent={0} />;
                } else if (el.tag === "AppdxFig") {
                    return <NavAppdxFig {...props} key={i} el={el} indent={0} />;
                } else if (el.tag === "AppdxNote") {
                    return <NavAppdxNote {...props} key={i} el={el} indent={0} />;
                } else if (el.tag === "AppdxFormat") {
                    return <NavAppdxFormat {...props} key={i} el={el} indent={0} />;
                } else if (el.tag === "Appdx") {
                    return <NavAppdx {...props} key={i} el={el} indent={0} />;
                } else {
                    return assertNever(el);
                }
            })}
        </>
    );
};

const NavBlock: React.FC<{law: std.Law | null} & TOCItemPropsForPath> = props => {
    if (props.law) {
        const lawBody = props.law.children.find((el) => el.tag === "LawBody") as std.LawBody;
        return (
            <LawNavDiv>
                <NavLaw {...props} el={props.law} indent={0} />
                <LawBody {...props} el={lawBody}/>
            </LawNavDiv>
        );
    }
    return null;
};


const SidebarBody: React.FC<{law: std.Law | null} & TOCItemPropsForPath> = props => {
    const MemoNavBlock = React.useMemo(() => React.memo(NavBlock), []);
    return (
        <SidebarBodyDiv>
            <MemoNavBlock {...props} law={props.law} />
        </SidebarBodyDiv>
    );
};


const SidebarFooterDiv = styled.div`
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
`;

const SidebarFooter: React.FC = () => {
    return (
        <SidebarFooterDiv>
            <div style={{ fontSize: "0.8em", padding: "0.3em 0.3em 0 0.3em", color: "rgb(140, 140, 140)", lineHeight: "1em" }}>
                法令検索・元データは<a href="https://elaws.e-gov.go.jp/" target="_blank" rel="noreferrer">e-Gov法令検索</a>・<a href="https://elaws.e-gov.go.jp/apitop/" target="_blank" rel="noreferrer">法令API</a>を使用しています。定義語・条項参照などの表示は<a href="https://github.com/yamachig/lawtext" target="_blank" rel="noreferrer">Lawtext</a>で別途解析・編集したものです。
            </div>
            <div style={{ fontSize: "0.8em", textAlign: "center", padding: "0.3em 0", color: "rgb(140, 140, 140)" }}>
                <span style={{ marginRight: "1em" }}>
                    <a href="https://github.com/yamachig/lawtext" target="_blank" rel="noreferrer">
                        GitHub
                    </a>
                    ・
                    <a href="https://yamachig.github.io/Lawtext/" target="_blank" rel="noreferrer">
                        Docs
                    </a>
                </span>
                &copy; 2017-{new Date().getFullYear()} yamachi
            </div>
        </SidebarFooterDiv >
    );
};


const SidebarDiv = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: rgb(243, 243, 243);
`;

export const Sidebar: React.FC<LawtextAppPageStateStruct> = props => {
    return (
        <SidebarDiv>
            <SidebarHead {...props} />
            <SidebarBody
                law={props.origState.law?.el ?? null}
                containers={props.origState.law?.analysis.containersByEL ?? new Map()}
                firstPart={props.origState.navigatedPath.split("/")[0]}
                navigate={props.navigate}
            />
            <SidebarFooter />
        </SidebarDiv >
    );
};
