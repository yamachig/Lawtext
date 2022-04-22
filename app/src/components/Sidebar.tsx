import React from "react";
import styled from "styled-components";
import * as std from "lawtext/dist/src/law/std";
import { assertNever } from "lawtext/dist/src/util";
import { EL } from "lawtext/dist/src/node/el";
import { LawtextAppPageStateStruct } from "./LawtextAppPageState";
import { downloadDocx, downloadLawtext, downloadXml } from "@appsrc/actions/download";
import { openFile } from "@appsrc/actions/openFile";
import { scrollToLawAnchor } from "@appsrc/actions/scroll";


const SidebarH1 = styled.h1`
    text-align: center;
    margin-top: 1rem;
    color: rgb(75, 75, 75);
`;

const SidebarHeadDiv = styled.div`
    flex-grow: 0;
    margin-bottom: 1rem;
`;

const SidebarHead: React.FC<LawtextAppPageStateStruct> = props => {
    const { origState, navigate, lawSearchKey } = props;

    const [editingKey, setEditingKey] = React.useState(lawSearchKey);

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        navigate(`/${editingKey}`);
    };

    const lawSearchKeyOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingKey(e.target.value);
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

    const downloadDocxAllClick = () => {
        if (origState.law) {
            downloadDocx(origState.law.el, false);
        }
    };

    const downloadDocxSelectionClick = () => {
        if (origState.law) {
            downloadDocx(origState.law.el, true);
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
                                <input
                                    name="lawSearchKey"
                                    onChange={lawSearchKeyOnChange}
                                    className="form-control search-law-textbox"
                                    style={{
                                        border: "none",
                                        padding: "0.45em",
                                        borderRadius: 0,
                                        borderBottomLeftRadius: ".25rem",
                                    }}
                                    placeholder="法令名か法令番号を検索" aria-label="法令名か法令番号を検索"
                                    value={editingKey}
                                />
                                <button
                                    className="btn btn-secondary"
                                    type="submit"
                                    style={{ borderRadius: 0, borderBottomRightRadius: ".25rem" }}
                                >
                                    検索
                                </button>
                            </div>
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
                            <span className="btn-group btn-group-sm">
                                <button
                                    onClick={downloadDocxAllClick}
                                    className="btn btn-outline-primary"
                                >
                                    Word
                                </button>
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
                            <span className="btn-group btn-group-sm" style={{ marginTop: "0.2rem" }}>
                                <button
                                    onClick={downloadDocxSelectionClick}
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

const LawNavDiv = styled.div`
    flex-grow: 1;
    flex-basis: 0;
    overflow-y: auto;
    border-top: 1px solid #d6d6d6;
    border-bottom: 1px solid #d6d6d6;
    padding: 0.4rem 0;
    font-size: 0.75em;
`;


const NavLaw: React.FC<{law: std.Law, indent: number}> = props => {
    const onClick = () => {
        scrollToLawAnchor(props.law.id.toString());
    };

    return (
        <TOCItemDiv
            style={{
                paddingLeft: (props.indent + 2) + "em",
            }}
            onClick={onClick}
        >
            {props.law.children.find(std.isLawBody)?.children.find(std.isLawTitle)?.text() ?? ""}
        </TOCItemDiv>
    );
};

const NavEnactStatement: React.FC<{enactStatement: std.EnactStatement, indent: number}> = props => {
    const onClick = () => {
        scrollToLawAnchor(props.enactStatement.id.toString());
    };

    return (
        <TOCItemDiv
            style={{
                paddingLeft: (props.indent + 2) + "em",
            }}
            onClick={onClick}
        >
            制定文
        </TOCItemDiv>
    );
};

const NavPreamble: React.FC<{preamble: std.Preamble, indent: number}> = props => {
    const onClick = () => {
        scrollToLawAnchor(props.preamble.id.toString());
    };

    return (
        <TOCItemDiv
            style={{
                paddingLeft: (props.indent + 2) + "em",
            }}
            onClick={onClick}
        >
            前文
        </TOCItemDiv>
    );
};

const NavTOC: React.FC<{toc: std.TOC, indent: number}> = props => {
    const tocLabel = props.toc.children.find((el) => el.tag === "TOCLabel") as std.TOCLabel | undefined;

    const onClick = () => {
        scrollToLawAnchor(props.toc.id.toString());
    };

    return tocLabel ? (
        <TOCItemDiv
            style={{
                paddingLeft: (props.indent + 2) + "em",
            }}
            onClick={onClick}
        >
            {tocLabel.text()}
        </TOCItemDiv>
    ) : null;
};

const NavArticleGroup: React.FC<{
    articleGroup: std.MainProvision | std.Part | std.Chapter | std.Section | std.Subsection | std.Division,
    indent: number,
}> = props => {
    return (<>
        {[...props.articleGroup.children].map((el, i) => {
            if (std.isArticleGroup(el)) {
                return <NavArticleGroup
                    key={i}
                    articleGroup={el}
                    indent={props.articleGroup.tag === "MainProvision" ? props.indent : props.indent + 1}
                />;

            } else if (std.isArticle(el)) {
                return <NavArticle
                    key={i}
                    article={el}
                    indent={props.articleGroup.tag === "MainProvision" ? props.indent : props.indent + 1}
                />;

            } else if (el.tag === "Paragraph" || el.tag === "PartTitle" || el.tag === "ChapterTitle" || el.tag === "SectionTitle" || el.tag === "SubsectionTitle" || el.tag === "DivisionTitle") {
                const onClick = () => {
                    scrollToLawAnchor(props.articleGroup.id.toString());
                };

                return (
                    <TOCItemDiv
                        key={i}
                        style={{
                            paddingLeft: (props.indent + 2) + "em",
                        }}
                        onClick={onClick}
                        title={el.text()}
                    >
                        {el.text()}
                    </TOCItemDiv>
                );

            } else {
                console.error(`unexpected element! ${JSON.stringify(el, undefined, 2)}`);
                return <NavAnyLaw
                    key={i}
                    el={el}
                    indent={props.indent}
                />;

            }
        })}
    </>);
};

const NavArticle: React.FC<{article: std.Article, indent: number}> = props => {
    const articleCaption = props.article.children.find((el) => el.tag === "ArticleCaption") as std.ArticleCaption | undefined;
    const articleTitle = props.article.children.find((el) => el.tag === "ArticleTitle") as std.ArticleCaption | undefined;

    if (articleTitle) {
        const name = articleTitle.text();
        let text = name;
        if (articleCaption) {
            const appendText = articleCaption.text();
            text += (appendText[0] === "（" ? "" : "　") + appendText;
        }

        const onClick = () => {
            scrollToLawAnchor(props.article.id.toString());
        };

        return (
            <TOCItemDiv
                style={{
                    paddingLeft: (props.indent + 2) + "em",
                }}
                onClick={onClick}
                title={text}
            >
                {text}
            </TOCItemDiv>
        );
    } else {
        return null;
    }
};

const NavSupplProvision: React.FC<{supplProvision: std.SupplProvision, indent: number}> = props => {
    const supplProvisionLabel = props.supplProvision.children.find((el) => el.tag === "SupplProvisionLabel") as std.SupplProvisionLabel | undefined;

    if (supplProvisionLabel) {
        const name = supplProvisionLabel.text();
        const amendLawNum = props.supplProvision.attr.AmendLawNum || "";
        // eslint-disable-next-line no-irregular-whitespace
        const text = (name + (amendLawNum ? ("（" + amendLawNum + "）") : "")).replace(/[\s　]+/, "");

        const onClick = () => {
            scrollToLawAnchor(props.supplProvision.id.toString());
        };

        return (
            <TOCItemDiv
                style={{
                    paddingLeft: (props.indent + 2) + "em",
                }}
                onClick={onClick}
                title={text}
            >
                {text}
            </TOCItemDiv>
        );
    } else {
        return null;
    }
};

const NavAppdxTable: React.FC<{appdxTable: std.AppdxTable, indent: number}> = props => {
    const appdxTableTitle = props.appdxTable.children.find((el) => el.tag === "AppdxTableTitle") as std.AppdxTableTitle | undefined;

    if (appdxTableTitle) {
        const onClick = () => {
            scrollToLawAnchor(props.appdxTable.id.toString());
        };

        return (
            <TOCItemDiv
                style={{
                    paddingLeft: (props.indent + 2) + "em",
                }}
                onClick={onClick}
                title={appdxTableTitle.text()}
            >
                {appdxTableTitle.text()}
            </TOCItemDiv>
        );
    } else {
        return null;
    }
};

const NavAppdxStyle: React.FC<{appdxStyle: std.AppdxStyle, indent: number}> = props => {
    const appdxStyleTitle = props.appdxStyle.children.find((el) => el.tag === "AppdxStyleTitle") as std.AppdxStyleTitle | undefined;

    if (appdxStyleTitle) {
        const onClick = () => {
            scrollToLawAnchor(props.appdxStyle.id.toString());
        };
        return (
            <TOCItemDiv
                style={{
                    paddingLeft: (props.indent + 2) + "em",
                }}
                onClick={onClick}
                title={appdxStyleTitle.text()}
            >
                {appdxStyleTitle.text()}
            </TOCItemDiv>
        );
    } else {
        return null;
    }
};

const NavAppdxFig: React.FC<{appdxFig: std.AppdxFig, indent: number}> = props => {
    const AppdxFigTitle = props.appdxFig.children.find((el) => el.tag === "AppdxFigTitle") as std.AppdxFigTitle | undefined;

    if (AppdxFigTitle) {
        const onClick = () => {
            scrollToLawAnchor(props.appdxFig.id.toString());
        };
        return (
            <TOCItemDiv
                style={{
                    paddingLeft: (props.indent + 2) + "em",
                }}
                onClick={onClick}
                title={AppdxFigTitle.text()}
            >
                {AppdxFigTitle.text()}
            </TOCItemDiv>
        );
    } else {
        return null;
    }
};

const NavAppdxFormat: React.FC<{appdxFig: std.AppdxFormat, indent: number}> = props => {
    const appdxFormatTitle = props.appdxFig.children.find((el) => el.tag === "AppdxFormatTitle") as std.AppdxFormatTitle | undefined;

    if (appdxFormatTitle) {
        const onClick = () => {
            scrollToLawAnchor(props.appdxFig.id.toString());
        };
        return (
            <TOCItemDiv
                style={{
                    paddingLeft: (props.indent + 2) + "em",
                }}
                onClick={onClick}
                title={appdxFormatTitle.text()}
            >
                {appdxFormatTitle.text()}
            </TOCItemDiv>
        );
    } else {
        return null;
    }
};

const NavAppdxNote: React.FC<{appdxFig: std.AppdxNote, indent: number}> = props => {
    const appdxNoteTitle = props.appdxFig.children.find((el) => el.tag === "AppdxNoteTitle") as std.AppdxNoteTitle | undefined;

    if (appdxNoteTitle) {
        const onClick = () => {
            scrollToLawAnchor(props.appdxFig.id.toString());
        };
        return (
            <TOCItemDiv
                style={{
                    paddingLeft: (props.indent + 2) + "em",
                }}
                onClick={onClick}
                title={appdxNoteTitle.text()}
            >
                {appdxNoteTitle.text()}
            </TOCItemDiv>
        );
    } else {
        return null;
    }
};


const NavAppdx: React.FC<{appdxFig: std.Appdx, indent: number}> = props => {
    const ArithFormulaNum = props.appdxFig.children.find((el) => el.tag === "ArithFormulaNum") as std.ArithFormulaNum | undefined;

    if (ArithFormulaNum) {
        const onClick = () => {
            scrollToLawAnchor(props.appdxFig.id.toString());
        };
        return (
            <TOCItemDiv
                style={{
                    paddingLeft: (props.indent + 2) + "em",
                }}
                onClick={onClick}
                title={ArithFormulaNum.text()}
            >
                {ArithFormulaNum.text()}
            </TOCItemDiv>
        );
    } else {
        return null;
    }
};

const NavAnyLaw: React.FC<{el: EL, indent: number}> = props => {
    const titleEL = props.el.children.find(c => typeof c !== "string" && c.tag.includes("Title")) as EL | undefined || props.el;

    if (titleEL) {
        const onClick = () => {
            scrollToLawAnchor(props.el.id.toString());
        };
        return (
            <TOCItemDiv
                style={{
                    paddingLeft: (props.indent + 2) + "em",
                }}
                onClick={onClick}
                title={titleEL.text()}
            >
                {titleEL.text()}
            </TOCItemDiv>
        );
    } else {
        return null;
    }
};

const LawBody: React.FC<{lawBody: std.LawBody}> = props => {
    return (
        <>
            {props.lawBody.children.map((el, i) => {
                if (el.tag === "LawTitle") {
                    return null;
                } else if (el.tag === "EnactStatement") {
                    return <NavEnactStatement key={i} enactStatement={el} indent={0} />;
                } else if (el.tag === "TOC") {
                    return <NavTOC key={i} toc={el} indent={0} />;
                } else if (el.tag === "Preamble") {
                    return <NavPreamble key={i} preamble={el} indent={0} />;
                } else if (el.tag === "MainProvision") {
                    return <NavArticleGroup key={i} articleGroup={el} indent={0} />;
                } else if (el.tag === "SupplProvision") {
                    return <NavSupplProvision key={i} supplProvision={el} indent={0} />;
                } else if (el.tag === "AppdxTable") {
                    return <NavAppdxTable key={i} appdxTable={el} indent={0} />;
                } else if (el.tag === "AppdxStyle") {
                    return <NavAppdxStyle key={i} appdxStyle={el} indent={0} />;
                } else if (el.tag === "AppdxFig") {
                    return <NavAppdxFig key={i} appdxFig={el} indent={0} />;
                } else if (el.tag === "AppdxNote") {
                    return <NavAppdxNote key={i} appdxFig={el} indent={0} />;
                } else if (el.tag === "AppdxFormat") {
                    return <NavAppdxFormat key={i} appdxFig={el} indent={0} />;
                } else if (el.tag === "Appdx") {
                    return <NavAppdx key={i} appdxFig={el} indent={0} />;
                } else {
                    return assertNever(el);
                }
            })}
        </>
    );
};

const NavBlock: React.FC<{law: std.Law | null}> = props => {
    if (props.law) {
        const lawBody = props.law.children.find((el) => el.tag === "LawBody") as std.LawBody;
        return (
            <LawNavDiv>
                <NavLaw law={props.law} indent={0} />
                <LawBody lawBody={lawBody}/>
            </LawNavDiv>
        );
    }
    return null;
};


const SidebarBody: React.FC<{law: std.Law | null}> = props => {
    const MemoNavBlock = React.useMemo(() => React.memo(NavBlock), []);
    return (
        <SidebarBodyDiv>
            <MemoNavBlock law={props.law} />
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
            <div style={{ fontSize: "0.8em", textAlign: "center", padding: "0.3em 0", color: "rgb(192, 192, 192)" }}>
                <a href="https://github.com/yamachig/lawtext" target="_blank" rel="noreferrer" style={{ marginRight: "2em" }}>
                        GitHub
                </a>
                &copy; 2017-{new Date().getFullYear()} yamachi
            </div >
        </SidebarFooterDiv >
    );
};


const SidebarDiv = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

export const Sidebar: React.FC<LawtextAppPageStateStruct> = props => {
    return (
        <SidebarDiv>
            <SidebarHead {...props} />
            <SidebarBody law={props.origState.law?.el ?? null} />
            <SidebarFooter />
        </SidebarDiv >
    );
};
