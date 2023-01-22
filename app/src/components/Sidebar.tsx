import React from "react";
import styled from "styled-components";
import * as std from "lawtext/dist/src/law/std";
import { assertNever } from "lawtext/dist/src/util";
import { EL } from "lawtext/dist/src/node/el";
import { LawtextAppPageStateStruct } from "./LawtextAppPageState";
import { downloadDocx, downloadLawtext, downloadXml } from "@appsrc/actions/download";
import { openFile } from "@appsrc/actions/openFile";
import { scrollToLawAnchor } from "@appsrc/actions/scroll";
import { Container } from "lawtext/dist/src/node/container";
import makePath from "lawtext/dist/src/path/v1/make";
import { NavigateFunction } from "react-router-dom";


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
    const { origState, navigate } = props;

    const [editingKey, setEditingKey] = React.useState("");

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        navigate(`/${editingKey.replace("/", "")}`);
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
                <a href="https://github.com/yamachig/lawtext" target="_blank" rel="noreferrer" style={{ marginRight: "2em" }}>
                        GitHub
                </a>
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
