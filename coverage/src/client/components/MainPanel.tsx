import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as law_diff from "lawtext/dist/src/diff/law_diff";
import { assertNever } from "lawtext/dist/src/util";
import * as React from "react";
import styled from "styled-components";
import LawCoverageInfoCard, { LawCoverageInfoCardStatus } from "./LawCoverageInfoCard";
import { LawtextDashboardPageStateStruct } from "./LawtextDashboardPageState";
import { LawCoverage } from "../../lawCoverage";
import { getLawDiffStatus, getOriginalLawStatus, getParsedLawStatus, getRenderedLawtextStatus, OriginalLawStatus, RenderedLawtextStatus, ParsedLawStatus, LawDiffStatus } from "./FilterInfo";


type ZipItem<T extends unknown[][]> = { [I in keyof T]: T[I] extends Array<infer U> ? U : never };
function* zipLongest<T extends unknown[][]>(lists: T, defaultValues: ZipItem<T>): IterableIterator<ZipItem<T>> {
    if (lists.length !== defaultValues.length) throw new Error("Length mismatch");
    const maxLength = Math.max(...lists.map(list => list.length));
    for (let i = 0; i < maxLength; i++) {
        yield lists.map((list, li) => i < list.length ? list[i] : defaultValues[li]) as ZipItem<T>;
    }
}


const itemToSpans = (item: Partial<law_diff.DiffTableItemData>) => {
    const ret: JSX.Element[] = [];
    if (item.type === law_diff.TagType.Open || item.type === law_diff.TagType.Empty) {
        if (item.attr && item.attr.length) {
            const attr = item.attr;
            ret.push(
                <span key={ret.length}>
                    <span>&lt;</span>
                    <span>{item.tag}</span>
                </span>,
            );
            ret.push(
                ...Object.keys(attr).map((key, i) => (
                    <span key={ret.length + i}>
                        <span>&nbsp;&nbsp;</span>
                        <span>{key}</span>
                        <span>=</span>
                        <span>&quot;{attr[key]}&quot;</span>
                    </span>
                )),
            );
            ret.push(
                <span key={ret.length}>
                    <span>{item.type === law_diff.TagType.Empty ? "/" : ""}&gt;</span>
                </span>,
            );
        } else {
            ret.push(
                <span key={ret.length}>
                    <span>&lt;</span>
                    <span>{item.tag}</span>
                    <span>{item.type === law_diff.TagType.Empty ? "&nbsp;/" : ""}&gt;</span>
                </span>,
            );
        }

    } else if (item.type === law_diff.TagType.Close) {
        ret.push(
            <span key={ret.length}>
                <span>&lt;/</span>
                <span>{item.tag}</span>
                <span>&gt;</span>
            </span>,
        );

    } else if (item.type === law_diff.TagType.Text) {
        ret.push(
            <span key={ret.length}>{item.text}</span>,
        );

    } else if (item.type === undefined) {
        /* */

    } else { throw assertNever(item.type); }

    return ret;
};

const makeElementMismatchTable = (ditem: law_diff.LawDiffElementMismatchData) => {
    const table: Row[] = [];
    for (const drow of ditem.diffTable) {
        const oldItem = drow.oldItem;
        const newItem = drow.newItem;
        const ColorSpan =
                drow.status === law_diff.DiffStatus.NoChange ? NoProblemColorSpan
                    : drow.status === law_diff.DiffStatus.Change ? ErrorColorSpan
                        : drow.status === law_diff.DiffStatus.Add ? AddColorSpan
                            : drow.status === law_diff.DiffStatus.Remove ? RemoveColorSpan
                                : assertNever(drow);
        const lists: [JSX.Element[], JSX.Element[], JSX.Element[], JSX.Element[]] = [
            (
                oldItem
                    ? [<ColorSpan key={0}><LawPosSpan>{oldItem.pos ? oldItem.pos.str : ""}</LawPosSpan></ColorSpan>]
                    : []
            ),
            (
                oldItem
                    ? itemToSpans(oldItem).map((item, i) => (
                        <ColorSpan key={i}>{item}</ColorSpan>
                    ))
                    : []
            ),
            (
                newItem
                    ? [<ColorSpan key={0}><LawPosSpan>{newItem.pos ? newItem.pos.str : ""}</LawPosSpan></ColorSpan>]
                    : []
            ),
            (
                newItem
                    ? itemToSpans(newItem).map((item, i) => (
                        <ColorSpan key={i}>{item}</ColorSpan>
                    ))
                    : []
            ),
        ];
        const colsSet = [...zipLongest(lists, [<span key={0} />, <span key={0} />, <span key={0} />, <span key={0} />])];
        table.push(...colsSet.map(cols => ({ type: RowType.NoProblem, cols })));
    }
    return table;
};

const makeElementChangeTable = (ditem: law_diff.LawDiffElementChangeData) => {
    const table: Row[] = [];
    const oldItem = ditem.oldItem;
    const newItem = ditem.newItem;

    const PosColorSpan =
            ditem.mostSeriousStatus === law_diff.ProblemStatus.NoProblem ? NoProblemColorSpan
                : ditem.mostSeriousStatus === law_diff.ProblemStatus.Warning ? WarningColorSpan
                    : ditem.mostSeriousStatus === law_diff.ProblemStatus.Error ? ErrorColorSpan
                        : assertNever(ditem.mostSeriousStatus);
    table.push({
        type: RowType.NoProblem,
        cols: [
            <PosColorSpan key={0}><LawPosSpan>* {oldItem.pos ? oldItem.pos.str : ""}</LawPosSpan></PosColorSpan>,
            <NoProblemColorSpan key={0}>
                <span>&lt;</span>
                <span>{oldItem.tag}</span>
            </NoProblemColorSpan>,
            <PosColorSpan key={0}><LawPosSpan>* {newItem.pos ? newItem.pos.str : ""}</LawPosSpan></PosColorSpan>,
            <NoProblemColorSpan key={0}>
                <span>&lt;</span>
                <span>{newItem.tag}</span>
            </NoProblemColorSpan>,
        ],
    });

    for (const key of ditem.nochangeKeys) {
        const ColorSpan = NoProblemColorSpan;
        table.push({
            type: RowType.NoProblem,
            cols: [
                <span key={0} />,
                <ColorSpan key={0}>
                    <span>&nbsp;&nbsp;</span>
                    <span>{key}</span>
                    <span>=</span>
                    <span>&quot;{oldItem.attr[key]}&quot;</span>
                </ColorSpan>,
                <span key={0} />,
                <ColorSpan key={0}>
                    <span>&nbsp;&nbsp;</span>
                    <span>{key}</span>
                    <span>=</span>
                    <span>&quot;{newItem.attr[key]}&quot;</span>
                </ColorSpan>,
            ],
        });
    }

    for (const [key, status] of ditem.changedKeys) {
        const ColorSpan =
                status === law_diff.ProblemStatus.NoProblem ? NoProblemColorSpan
                    : status === law_diff.ProblemStatus.Warning ? WarningColorSpan
                        : status === law_diff.ProblemStatus.Error ? ErrorColorSpan
                            : assertNever(status);
        const rowType =
                status === law_diff.ProblemStatus.NoProblem ? RowType.NoProblem
                    : status === law_diff.ProblemStatus.Warning ? RowType.Warning
                        : status === law_diff.ProblemStatus.Error ? RowType.Error
                            : assertNever(status);
        table.push({
            type: rowType,
            cols: [
                <ColorSpan key={0}>*</ColorSpan>,
                <NoProblemColorSpan key={0}>
                    <span>&nbsp;&nbsp;</span>
                    <span>{key}</span>
                    <span>=</span>
                    <span>&quot;<ColorSpan>{oldItem.attr[key]}</ColorSpan>&quot;</span>
                </NoProblemColorSpan>,
                <ColorSpan key={0}>*</ColorSpan>,
                <NoProblemColorSpan key={0}>
                    <span>&nbsp;&nbsp;</span>
                    <span>{key}</span>
                    <span>=</span>
                    <span>&quot;<ColorSpan>{newItem.attr[key]}</ColorSpan>&quot;</span>
                </NoProblemColorSpan>,
            ],
        });
    }

    for (const [key, status] of ditem.removedKeys) {
        const ColorSpan =
                status === law_diff.ProblemStatus.NoProblem ? NoProblemColorSpan
                    : status === law_diff.ProblemStatus.Warning ? WarningColorSpan
                        : status === law_diff.ProblemStatus.Error ? RemoveColorSpan
                            : assertNever(status);
        const rowType =
                status === law_diff.ProblemStatus.NoProblem ? RowType.NoProblem
                    : status === law_diff.ProblemStatus.Warning ? RowType.Warning
                        : status === law_diff.ProblemStatus.Error ? RowType.Remove
                            : assertNever(status);
        table.push({
            type: rowType,
            cols: [
                <ColorSpan key={0}>-</ColorSpan>,
                <ColorSpan key={0}>
                    <span>&nbsp;&nbsp;</span>
                    <span>{key}</span>
                    <span>=</span>
                    <span>&quot;{oldItem.attr[key]}&quot;</span>
                </ColorSpan>,
                <span key={0} />,
                <span key={0} />,
            ],
        });
    }

    for (const [key, status] of ditem.addedKeys) {
        const ColorSpan =
                status === law_diff.ProblemStatus.NoProblem ? NoProblemColorSpan
                    : status === law_diff.ProblemStatus.Warning ? WarningColorSpan
                        : status === law_diff.ProblemStatus.Error ? AddColorSpan
                            : assertNever(status);
        const rowType =
                status === law_diff.ProblemStatus.NoProblem ? RowType.NoProblem
                    : status === law_diff.ProblemStatus.Warning ? RowType.Warning
                        : status === law_diff.ProblemStatus.Error ? RowType.Add
                            : assertNever(status);
        table.push({
            type: rowType,
            cols: [
                <span key={0} />,
                <span key={0} />,
                <ColorSpan key={0}>+</ColorSpan>,
                <ColorSpan key={0}>
                    <span>&nbsp;&nbsp;</span>
                    <span>{key}</span>
                    <span>=</span>
                    <span>&quot;{newItem.attr[key]}&quot;</span>
                </ColorSpan>,
            ],
        });
    }

    table.push({
        type: RowType.NoProblem,
        cols: [
            <span key={0} />,
            <NoProblemColorSpan key={0}>
                <span>{oldItem.type === law_diff.TagType.Empty ? "/" : ""}&gt;</span>
            </NoProblemColorSpan>,
            <span key={0} />,
            <NoProblemColorSpan key={0}>
                <span>{newItem.type === law_diff.TagType.Empty ? "/" : ""}&gt;</span>
            </NoProblemColorSpan>,
        ],
    });

    return table;
};

const NO_DIFF_SHOW_LINES = 3;

const makeElementNoDiffTable = (ditem: law_diff.LawDiffNoDiffData) => {
    const table: Row[] = [];
    for (const [i, drow] of ditem.diffTable.entries()) {
        if (i < NO_DIFF_SHOW_LINES || ditem.diffTable.length - NO_DIFF_SHOW_LINES <= i) {
            const oldItem = drow.oldItem;
            const newItem = drow.newItem;
            const ColorSpan =
                    drow.status === law_diff.DiffStatus.NoChange ? NoProblemColorSpan
                        : drow.status === law_diff.DiffStatus.Change ? ErrorColorSpan
                            : drow.status === law_diff.DiffStatus.Add ? AddColorSpan
                                : drow.status === law_diff.DiffStatus.Remove ? RemoveColorSpan
                                    : assertNever(drow);
            const lists: [JSX.Element[], JSX.Element[], JSX.Element[], JSX.Element[]] = [
                (
                    oldItem
                        ? [<ColorSpan key={0}><LawPosSpan>{oldItem.pos ? oldItem.pos.str : ""}</LawPosSpan></ColorSpan>]
                        : []
                ),
                (
                    oldItem
                        ? itemToSpans(oldItem).map((item, j) => (
                            <ColorSpan key={j}>{item}</ColorSpan>
                        ))
                        : []
                ),
                (
                    newItem
                        ? [<ColorSpan key={0}><LawPosSpan>{newItem.pos ? newItem.pos.str : ""}</LawPosSpan></ColorSpan>]
                        : []
                ),
                (
                    newItem
                        ? itemToSpans(newItem).map((item, j) => (
                            <ColorSpan key={j}>{item}</ColorSpan>
                        ))
                        : []
                ),
            ];
            const colsSet = [...zipLongest(lists, [<span key={0} />, <span key={0} />, <span key={0} />, <span key={0} />])];
            table.push(...colsSet.map(cols => ({ type: RowType.NoProblem, cols })));
        } else if (i === NO_DIFF_SHOW_LINES && i < ditem.diffTable.length - NO_DIFF_SHOW_LINES) {
            table.push({
                type: RowType.Empty,
                cols: [
                    <NoProblemColorSpan key={0}>&nbsp;<FontAwesomeIcon icon="ellipsis-v" /></NoProblemColorSpan>,
                    <NoProblemColorSpan key={0}>&nbsp;<FontAwesomeIcon icon="ellipsis-v" /></NoProblemColorSpan>,
                    <NoProblemColorSpan key={0}>&nbsp;<FontAwesomeIcon icon="ellipsis-v" /></NoProblemColorSpan>,
                    <NoProblemColorSpan key={0}>&nbsp;<FontAwesomeIcon icon="ellipsis-v" /></NoProblemColorSpan>,
                ],
            });
        }
    }

    return table;
};

const LawPosSpan = styled.span`
        white-space: nowrap;
    `;

const NoProblemColorSpan = styled.span`
        color: #818182;
    `;

const ErrorColorSpan = styled.span`
        font-weight: bold;
        color: #f0ad4e;
    `;

const WarningColorSpan = styled.span`
        font-weight: bold;
        color: #5bc0de;
    `;

const AddColorSpan = styled.span`
        font-weight: bold;
        color: #5cb85c;
    `;

const RemoveColorSpan = styled.span`
        font-weight: bold;
        color: #d9534f;
    `;

const BaseRow = styled.tr`
    `;

const EmptyRow = styled(BaseRow)`
        background-color: #e2e3e5;
    `;

const NoProblemRow = styled(BaseRow)`
        background-color: #fefefe;
    `;

const ErrorRow = styled(BaseRow)`
        background-color: #fff3cd;
    `;

const WarningRow = styled(BaseRow)`
        background-color: #d1ecf1;
    `;

const AddRow = styled(BaseRow)`
        background-color: #d4edda;
    `;

const RemoveRow = styled(BaseRow)`
        background-color: #f8d7da;
    `;

const LawDiffTable = styled.table`
        font-size: 0.8em;
        font-family: Consolas, Menlo, "Liberation Mono", Courier, monospace;
        border: 1px solid #d6d8db;
        border-spacing: 0;
        border-radius: .25rem;
        border-collapse: separate;
        overflow: hidden;
        td {
            padding: 0 0.25em;
        }
        td:first-child {
            border-left: none;
        }
    `;

const PosCol = styled.td`
        background-color: rgba(0,0,0,.05);
        border-left: 1px solid #d6d8db;
        border-right: 1px solid #d6d8db;
    `;

const ValCol = styled.td`
    `;

const LawCoverageInfoDetailTag = styled.div`
        display: flex;
        flex-direction: column;

        h3 {
            font-size: 1.2rem;
        }

        pre {
            border: 1px solid #d6d8db;
            border-radius: .25rem;
            padding: .25rem;
        }

        > div:nth-child(1) {
            flex: 0 0 auto;
        }

        > div:nth-child(2) {
            flex: 0 1 auto;
            overflow-y: auto;
        }
    `;

enum RowType {
    Empty,
    NoProblem,
    Error,
    Warning,
    Add,
    Remove,
}

function withRowTag<T>(type: RowType, f: (RowTag: React.ComponentType) => T) {
    const RowTag =
            type === RowType.Empty ? EmptyRow :
                type === RowType.NoProblem ? NoProblemRow :
                    type === RowType.Error ? ErrorRow :
                        type === RowType.Warning ? WarningRow :
                            type === RowType.Add ? AddRow :
                                type === RowType.Remove ? RemoveRow :
                                    assertNever(type);
    return f(RowTag);
}

interface Row { type: RowType, cols: [JSX.Element, JSX.Element, JSX.Element, JSX.Element] }


const LawDiffResultItems: React.FC<{lawCoverage: LawCoverage}> = props => {

    const table: Row[] = [];

    for (const ditem of props.lawCoverage.lawDiff?.ok?.result.items ?? []) {
        if (ditem.type === law_diff.LawDiffType.ElementMismatch) {
            table.push(...makeElementMismatchTable(ditem));

        } else if (ditem.type === law_diff.LawDiffType.ElementChange) {
            table.push(...makeElementChangeTable(ditem));

        } else if (ditem.type === law_diff.LawDiffType.NoDiff) {
            table.push(...makeElementNoDiffTable(ditem));

        } else { throw assertNever(ditem); }
    }

    return (
        <div>
            <LawDiffTable>
                <tbody>
                    {table.map(({ type: rowType, cols: [oldPosCol, oldValCol, newPosCol, newValCol] }, r) =>
                        withRowTag(rowType, RowTag => (
                            <RowTag key={r}>
                                <PosCol>
                                    {oldPosCol}
                                </PosCol>
                                <ValCol>
                                    {oldValCol}
                                </ValCol>
                                <PosCol>
                                    {newPosCol}
                                </PosCol>
                                <ValCol>
                                    {newValCol}
                                </ValCol>
                            </RowTag>
                        )),
                    )}
                </tbody>
            </LawDiffTable>
        </div>
    );
};

export const convertStatus = (s: OriginalLawStatus | RenderedLawtextStatus | ParsedLawStatus | LawDiffStatus): LawCoverageInfoCardStatus => {
    if (s === "Null") {
        return LawCoverageInfoCardStatus.NULL;
    } else if (s === "Success" || s === "NoProblem") {
        return LawCoverageInfoCardStatus.SUCCESS;
    } else if (s === "Warning") {
        return LawCoverageInfoCardStatus.WARNING;
    } else if (s === "Fail" || s === "Error") {
        return LawCoverageInfoCardStatus.ERROR;
    } else { throw assertNever(s); }
};

export const LawCoverageInfoDetail: React.FC<{
    detailLawCoverage: LawCoverage | null,
    LawID: string | undefined,
}> = props => {
    const lawCoverage = props.detailLawCoverage;
    if (!props.LawID) {
        return (
            <div style={{ backgroundColor: "#e2e3e5" }} />
        );
    } else if (!lawCoverage) {
        return (
            <div style={{ backgroundColor: "#e2e3e5", padding: "1em" }} />
        );
    } else {
        return (
            <LawCoverageInfoDetailTag>
                <div className="bg-light" style={{ borderBottom: "1px solid #d6d8db", padding: "1em" }}>
                    <div className="text-secondary">
                        <span>#{lawCoverage.LawID}</span>
                        {" "}
                        <span>{lawCoverage.LawNum}</span>
                        {" "}
                        <small>
                            <a href={`https://elaws.e-gov.go.jp/document?lawid=${encodeURI(lawCoverage.LawID)}`} target="_blank" rel="noreferrer">e-Gov <FontAwesomeIcon icon="external-link-alt" /></a>
                        </small>
                        {" "}
                        <small>
                            <a href={`https://yamachig.github.io/lawtext-app/#${lawCoverage.LawNum}`} target="_blank" rel="noreferrer">Lawtext <FontAwesomeIcon icon="external-link-alt" /></a>
                        </small>
                        {" "}
                        <small>
                            <a href={`/intermediateData/${lawCoverage.LawID}`} target="_blank" rel="noreferrer">中間データ <FontAwesomeIcon icon="external-link-alt" /></a>
                        </small>
                    </div>
                    <div className="text-secondary">
                        <strong>{lawCoverage.LawTitle}</strong>
                    </div>
                </div>
                <div style={{ padding: "1em" }}>
                    {lawCoverage.originalLaw && (
                        <div>
                            <h3 className="text-muted">Original XML</h3>
                            <div style={{ width: "7rem", marginBottom: "1em" }}>
                                <LawCoverageInfoCard
                                    status={convertStatus(getOriginalLawStatus(lawCoverage))}
                                    date={lawCoverage.updateDate}
                                />
                            </div>
                            {"error" in lawCoverage.originalLaw.info && (
                                <pre>{lawCoverage.originalLaw.info.error as string}</pre>
                            )}
                            <hr />
                        </div>
                    )}
                    {lawCoverage.renderedLawtext && (
                        <div>
                            <h3 className="text-muted">Rendered Lawtext</h3>
                            <div style={{ width: "7rem", marginBottom: "1em" }}>
                                <LawCoverageInfoCard
                                    status={convertStatus(getRenderedLawtextStatus(lawCoverage))}
                                    date={lawCoverage.updateDate}
                                />
                            </div>
                            {"error" in lawCoverage.renderedLawtext.info && (
                                <pre>{lawCoverage.renderedLawtext.info.error as string}</pre>
                            )}
                            <hr />
                        </div>
                    )}
                    {lawCoverage.parsedLaw && (
                        <div>
                            <h3 className="text-muted">Parsed XML</h3>
                            <div style={{ width: "7rem", marginBottom: "1em" }}>
                                <LawCoverageInfoCard
                                    status={convertStatus(getParsedLawStatus(lawCoverage))}
                                    date={lawCoverage.updateDate}
                                />
                            </div>
                            {"error" in lawCoverage.parsedLaw.info && (
                                <pre>{lawCoverage.parsedLaw.info.error as string}</pre>
                            )}
                            <hr />
                        </div>
                    )}
                    {lawCoverage.lawDiff ? (
                        <div>
                            <h3 className="text-muted">Difference</h3>
                            <div style={{ width: "7rem", marginBottom: "1em" }}>
                                <LawCoverageInfoCard
                                    status={convertStatus(getLawDiffStatus(lawCoverage))}
                                    date={lawCoverage.updateDate}
                                />
                            </div>
                            {"error" in lawCoverage.lawDiff.info && (
                                <pre>{lawCoverage.lawDiff.info.error as string}</pre>
                            )}
                            {lawCoverage.lawDiff.ok?.result.items.length && (
                                <LawDiffResultItems lawCoverage={lawCoverage}/>
                            )}
                            <hr />
                        </div>
                    ) : ""}
                </div>
            </LawCoverageInfoDetailTag>
        );
    }
};

const MainPanelTag = styled.div`
flex: 1 1;
position: relative;
> div {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
    }
`;

const MainPanel: React.FC<LawtextDashboardPageStateStruct> = props => {
    return (
        <MainPanelTag>
            <LawCoverageInfoDetail
                detailLawCoverage={props.origState.detailLawCoverage}
                LawID={props.routeParams.LawID}
            />
        </MainPanelTag>
    );
};

export default MainPanel;

