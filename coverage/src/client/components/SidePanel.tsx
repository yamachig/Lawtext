import type { LawCoverage } from "../../lawCoverage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import styled from "styled-components";
import { getLawDiffStatus, getOriginalLawStatus, getParsedLawStatus, getRenderedHTMLStatus, getRenderedDocxStatus, getRenderedLawtextStatus, LawDiffStatus, OriginalLawStatus, ParsedLawStatus, RenderedHTMLStatus, RenderedDocxStatus, RenderedLawtextStatus, SortDirection, SortKey } from "./FilterInfo";
import LawCoverageInfoCard from "./LawCoverageInfoCard";
import type { LawCoveragesStruct, LawtextDashboardPageStateStruct } from "./LawtextDashboardPageState";
import { useLawCoverageCounts, useLawCoveragesStruct } from "./LawtextDashboardPageState";
import { convertStatus } from "./MainPanel";
import type {
    DragEndEvent } from "@dnd-kit/core";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
} from "@dnd-kit/sortable";
import type { Transform } from "@dnd-kit/utilities";
import { CSS } from "@dnd-kit/utilities";

interface FilterInfoSortItemProps {
    sort: (
        [SortKey, SortDirection] |
        null |
        SortKey
    ),
    directionButtonClick: () => void;
    sortableID: string;
}

const KeyToName = {
    [SortKey.ID]: "ID",
    [SortKey.LawNum]: "番号",
    [SortKey.LawType]: "種別",
    [SortKey.RenderedHTMLStatus]: "HTML",
    [SortKey.RenderedDocxStatus]: "Docx",
    [SortKey.RenderedLawtextStatus]: "Rendered",
    [SortKey.ParsedLawStatus]: "Parsed",
    [SortKey.LawDiffStatus]: "Diff",
};

const ItemBase = styled.div`
    display: inline-block;
    padding: 0.25em 0.4em;
    margin: 0.1em;
    font-size: 75%;
    font-weight: 700;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: 0.25rem;
    cursor: default;
`;

const ActiveItem = styled(ItemBase)`
    color: #fff;
    background-color: #007bff;
`;

const RestItem = styled(ItemBase)`
    color: #212529;
    background-color: #f8f9fa;
`;

const NullItem = styled(ItemBase)`
    color: #fff;
    background-color: #6c757d;
`;

const ButtonBase = styled.button`
    display: inline-block;
    font-size: 75%;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    user-select: none;
    border: 1px solid transparent;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    padding: 0.05em 0.3em;
    margin-left: 0.3em;

    line-height: 1.5;
    border-radius: 0.2em;
    cursor: pointer;
    min-width: 2em;
`;

const ButtonOn = styled(ButtonBase)`
    color: #212529;
    background-color: #f8f9fa;
    border-color: #f8f9fa;

    :hover {
        color: #212529;
        background-color: #e2e6ea;
        border-color: #dae0e5;
    }

    :active {
        color: #212529;
        background-color: #dae0e5;
        border-color: #d3d9df;
    }

    :focus {
        box-shadow: 0 0 0 0.2rem rgba(248,249,250,.5);
    }
`;

const ButtonOff = styled(ButtonBase)`
    color: #6c757d;
    background-color: transparent;
    background-image: none;
    border-color: #6c757d;

    :hover {
        color: #fff;
        background-color: #6c757d;
        border-color: #6c757d;
    }

    :active {
        color: #fff;
        background-color: #6c757d;
        border-color: #6c757d;
    }

    :focus {
        box-shadow: 0 0 0 0.2rem rgba(108,117,125,.5);
    }
`;

const ButtonDummy = styled(ButtonBase)`
        color: #212529;
        background-color: #f8f9fa;
        border-color: #f8f9fa;
        pointer-events: none;
    `;

export const FilterInfoSortItem = (props: FilterInfoSortItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.sortableID });

    const style = {
        transform: CSS.Transform.toString({ ...transform, scaleX: 1, scaleY: 1 } as Transform),
        transition,
    };

    if (Array.isArray(props.sort)) {
        const [key, dir] = props.sort;
        const ButtonTag = dir === SortDirection.Asc ? ButtonOff : ButtonOn;
        return (
            <ActiveItem ref={setNodeRef} style={style} {...attributes} {...listeners}>
                <span style={{ verticalAlign: "middle" }}>{KeyToName[key]}</span>
                <ButtonTag
                    onClick={props.directionButtonClick}
                    onPointerDown={e => e.stopPropagation()}
                >
                    <FontAwesomeIcon icon="exchange-alt" style={{ pointerEvents: "none" }} />
                </ButtonTag>
            </ActiveItem>
        );
    } else if (props.sort) {
        const key = props.sort;
        return (
            <RestItem ref={setNodeRef} style={style} {...attributes} {...listeners}>
                <span style={{ verticalAlign: "middle" }}>{KeyToName[key]}</span>
                <ButtonDummy disabled={true}>
                    <FontAwesomeIcon icon="minus" style={{ pointerEvents: "none" }} />
                </ButtonDummy>
            </RestItem>
        );
    } else {
        return (
            <NullItem ref={setNodeRef} style={style} {...attributes} {...listeners}>
                <span style={{ verticalAlign: "middle" }}><FontAwesomeIcon icon="arrow-left" /></span>
            </NullItem>
        );
    }
};


interface FilterInfoSortContainerProps {
    sort: Array<
        [SortKey, SortDirection] |
        null |
        SortKey
    >,
    directionButtonClick: (sortKey: SortKey) => void;
    onDragEnd: (event: DragEndEvent) => void;
}

export const FilterInfoSortContainer = (props: FilterInfoSortContainerProps) => {

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const directionButtonClick = (sort: FilterInfoSortContainerProps["sort"][0]) => () => {
        console.log("directionButtonClick");
        if (sort) {
            if (Array.isArray(sort)) props.directionButtonClick(sort[0]);
            else props.directionButtonClick(sort);
        }
    };
    return (
        <div className="d-flex flex-row">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={props.onDragEnd}
            >
                <SortableContext
                    items={props.sort.map(v => Array.isArray(v) ? v[0] : v ?? "null")}
                    strategy={horizontalListSortingStrategy}
                >
                    {props.sort.map((sort) => (
                        <FilterInfoSortItem
                            sort={sort}
                            sortableID={Array.isArray(sort) ? sort[0] : (sort ?? "null")}
                            key={Array.isArray(sort) ? sort[0] : (sort ?? "null")}
                            directionButtonClick={directionButtonClick(sort)}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
};


export const FilterInfoFilterContainer: React.FC<LawtextDashboardPageStateStruct> = props => {
    const counts = useLawCoverageCounts(props);
    if (!counts) return null;
    return (
        <>
            <div>
                <small style={{ verticalAlign: "middle" }}>
                    Orig:{" "}
                    {counts.OriginalLawStatus[OriginalLawStatus.Fail] !== 0 &&
                        <><span className="badge bg-dark">{counts.OriginalLawStatus[OriginalLawStatus.Fail]} Fails</span>&nbsp;</>
                    }
                    {counts.OriginalLawStatus[OriginalLawStatus.Success] !== 0 &&
                        <><span className="badge bg-success">{counts.OriginalLawStatus[OriginalLawStatus.Success]} Success</span>&nbsp;</>
                    }
                    {counts.OriginalLawStatus[OriginalLawStatus.Null] !== 0 &&
                        <><span className="badge bg-light text-dark">{counts.OriginalLawStatus[OriginalLawStatus.Null]} Null</span>&nbsp;</>
                    }
                </small>
            </div>
            <div>
                <small style={{ verticalAlign: "middle" }}>
                    RenderedHTML:{" "}
                    {counts.RenderedHTMLStatus[RenderedHTMLStatus.Fail] !== 0 &&
                        <><span className="badge bg-dark">{counts.RenderedHTMLStatus[RenderedHTMLStatus.Fail]} Fails</span>&nbsp;</>
                    }
                    {counts.RenderedHTMLStatus[RenderedHTMLStatus.Success] !== 0 &&
                        <><span className="badge bg-success">{counts.RenderedHTMLStatus[RenderedHTMLStatus.Success]} Success</span>&nbsp;</>
                    }
                    {counts.RenderedHTMLStatus[RenderedHTMLStatus.Null] !== 0 &&
                        <><span className="badge bg-light text-dark">{counts.RenderedHTMLStatus[RenderedHTMLStatus.Null]} Null</span>&nbsp;</>
                    }
                </small>
            </div>
            <div>
                <small style={{ verticalAlign: "middle" }}>
                    RenderedDocx:{" "}
                    {counts.RenderedDocxStatus[RenderedDocxStatus.Fail] !== 0 &&
                        <><span className="badge bg-dark">{counts.RenderedDocxStatus[RenderedDocxStatus.Fail]} Fails</span>&nbsp;</>
                    }
                    {counts.RenderedDocxStatus[RenderedDocxStatus.Success] !== 0 &&
                        <><span className="badge bg-success">{counts.RenderedDocxStatus[RenderedDocxStatus.Success]} Success</span>&nbsp;</>
                    }
                    {counts.RenderedDocxStatus[RenderedDocxStatus.Null] !== 0 &&
                        <><span className="badge bg-light text-dark">{counts.RenderedDocxStatus[RenderedDocxStatus.Null]} Null</span>&nbsp;</>
                    }
                </small>
            </div>
            <div>
                <small style={{ verticalAlign: "middle" }}>
                    RenderedLawtext:{" "}
                    {counts.RenderedLawtextStatus[RenderedLawtextStatus.Fail] !== 0 &&
                        <><span className="badge bg-dark">{counts.RenderedLawtextStatus[RenderedLawtextStatus.Fail]} Fails</span>&nbsp;</>
                    }
                    {counts.RenderedLawtextStatus[RenderedLawtextStatus.Success] !== 0 &&
                        <><span className="badge bg-success">{counts.RenderedLawtextStatus[RenderedLawtextStatus.Success]} Success</span>&nbsp;</>
                    }
                    {counts.RenderedLawtextStatus[RenderedLawtextStatus.Null] !== 0 &&
                        <><span className="badge bg-light text-dark">{counts.RenderedLawtextStatus[RenderedLawtextStatus.Null]} Null</span>&nbsp;</>
                    }
                </small>
            </div>
            <div>
                <small style={{ verticalAlign: "middle" }}>
                    Parsed:{" "}
                    {counts.ParsedLawStatus[ParsedLawStatus.Fail] !== 0 &&
                        <><span className="badge bg-dark">{counts.ParsedLawStatus[ParsedLawStatus.Fail]} Fails</span>&nbsp;</>
                    }
                    {counts.ParsedLawStatus[ParsedLawStatus.Error] !== 0 &&
                        <><span className="badge bg-danger">{counts.ParsedLawStatus[ParsedLawStatus.Error]} Error</span>&nbsp;</>
                    }
                    {counts.ParsedLawStatus[ParsedLawStatus.Success] !== 0 &&
                        <><span className="badge bg-success">{counts.ParsedLawStatus[ParsedLawStatus.Success]} Success</span>&nbsp;</>
                    }
                    {counts.ParsedLawStatus[ParsedLawStatus.Null] !== 0 &&
                        <><span className="badge bg-light text-dark">{counts.ParsedLawStatus[ParsedLawStatus.Null]} Null</span>&nbsp;</>
                    }
                </small>
            </div>
            <div>
                <small style={{ verticalAlign: "middle" }}>
                    Diff:{" "}
                    {counts.LawDiffStatus[LawDiffStatus.Fail] !== 0 &&
                        <><span className="badge bg-dark">{counts.LawDiffStatus[LawDiffStatus.Fail]} Fails</span>&nbsp;</>
                    }
                    {counts.LawDiffStatus[LawDiffStatus.Error] !== 0 &&
                        <><span className="badge bg-danger">{counts.LawDiffStatus[LawDiffStatus.Error]} Error</span>&nbsp;</>
                    }
                    {counts.LawDiffStatus[LawDiffStatus.Warning] !== 0 &&
                        <><span className="badge bg-warning text-dark">{counts.LawDiffStatus[LawDiffStatus.Warning]} Warning</span>&nbsp;</>
                    }
                    {counts.LawDiffStatus[LawDiffStatus.NoProblem] !== 0 &&
                        <><span className="badge bg-success">{counts.LawDiffStatus[LawDiffStatus.NoProblem]} NoProblem</span>&nbsp;</>
                    }
                    {counts.LawDiffStatus[LawDiffStatus.Null] !== 0 &&
                        <><span className="badge bg-light text-dark">{counts.LawDiffStatus[LawDiffStatus.Null]} Null</span>&nbsp;</>
                    }
                </small>
            </div>
        </>
    );
};


const FilterControlTag = styled.div`
    padding: 0.5em;
`;

interface FilterControlState {
    sort: Array<
        [SortKey, SortDirection] |
        null |
        SortKey
    >,
    lastDirection: {[key in SortKey]: SortDirection},
}


const onFilterControlSortEnd = (
    oldIndex: number,
    newIndex: number,
    stateStruct: LawtextDashboardPageStateStruct,
    state: FilterControlState,
    setState: React.Dispatch<React.SetStateAction<FilterControlState>>,
) => {
    if (oldIndex === newIndex) return;
    const movedSort = arrayMove(state.sort, oldIndex, newIndex);
    const nullIndex = movedSort.indexOf(null);

    const newActiveSort = (movedSort.slice(0, nullIndex) as Array<
        [SortKey, SortDirection] |
        SortKey
    >).map<[SortKey, SortDirection]>(sortKey => {
        if (Array.isArray(sortKey)) {
            return sortKey as [SortKey, SortDirection];
        } else {
            return [sortKey, state.lastDirection[sortKey]];
        }
    });

    const newRestSort = (movedSort.slice(nullIndex + 1) as Array<
        [SortKey, SortDirection] |
        SortKey
    >).map(sortKey => {
        if (Array.isArray(sortKey)) {
            return sortKey[0];
        } else {
            return sortKey;
        }
    });

    console.log([
        ...newActiveSort,
        null,
        ...newRestSort,
    ]);

    setState(s => ({
        ...s,
        sort: [
            ...newActiveSort,
            null,
            ...newRestSort,
        ],
    }));

    stateStruct.origSetState(s => ({
        ...s,
        filterInfo: {
            ...s.filterInfo,
            sort: newActiveSort,
        },
    }));

};


const filterControlDirectionButtonClick = (
    key: SortKey,
    stateStruct: LawtextDashboardPageStateStruct,
    state: FilterControlState,
    setState: React.Dispatch<React.SetStateAction<FilterControlState>>,
) => {
    const nullIndex = state.sort.indexOf(null);
    const activeSort = state.sort.slice(0, nullIndex) as Array<[SortKey, SortDirection]>;
    const restSort = state.sort.slice(nullIndex + 1) as SortKey[];

    const newLastDirection = { ...state.lastDirection };

    const newActiveSort = activeSort.map<[SortKey, SortDirection]>(([sortKey, dir]) => {
        if (sortKey === key) {
            const newDirection =
                (dir === SortDirection.Asc)
                    ? SortDirection.Desc
                    : SortDirection.Asc;
            newLastDirection[key] = newDirection;
            return [sortKey, newDirection];
        } else {
            return [sortKey, dir];
        }
    });

    setState(s => ({
        ...s,
        sort: [
            ...newActiveSort,
            null,
            ...restSort,
        ],
        lastDirection: newLastDirection,
    }));

    stateStruct.origSetState(s => ({
        ...s,
        filterInfo: {
            ...s.filterInfo,
            sort: newActiveSort,
        },
    }));
};

const FilterControl: React.FC<LawtextDashboardPageStateStruct> = props => {

    const [state, setState] = React.useState<FilterControlState>(() => {
        const restSortKey = (Object.values(SortKey) as SortKey[]).filter(sortKey => {
            for (const sort of props.origState.filterInfo.sort) {
                if (sort[0] === sortKey) return false;
            }
            return true;
        });
        const lastDirection = {} as {[key in SortKey]: SortDirection};
        for (const [key, dir] of props.origState.filterInfo.sort) {
            lastDirection[key] = dir;
        }
        for (const key of restSortKey) {
            lastDirection[key] = SortDirection.Asc;
        }
        return {
            sort: [
                ...props.origState.filterInfo.sort,
                null,
                ...restSortKey,
            ],
            lastDirection,
        };
    });

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const items = state.sort.map(v => Array.isArray(v) ? v[0] : v ?? "null");

        if (active.id !== over?.id) {
            const oldIndex = items.indexOf(active.id as SortKey);
            const newIndex = items.indexOf(over?.id as SortKey);
            onFilterControlSortEnd(oldIndex, newIndex, props, state, setState);
        }
    };

    return (
        <FilterControlTag>
            <div>
                <small style={{ verticalAlign: "middle" }}>並び替え：</small>
                <div style={{ display: "inline-block" }}>
                    <FilterInfoSortContainer
                        sort={state.sort}
                        onDragEnd={onDragEnd}
                        directionButtonClick={key => filterControlDirectionButtonClick(key, props, state, setState)}
                    />
                </div>
            </div>
            <FilterInfoFilterContainer {...props} />
        </FilterControlTag>
    );
};


const LawCoverageListItemTag = styled.div`
    `;

const LawCoverageListItem: React.FC<LawtextDashboardPageStateStruct & {lawCoverage: LawCoverage}> = props => {
    const lawCoverage = props.lawCoverage;
    return (
        <LawCoverageListItemTag>

            <div className="d-flex flex-column" style={{ flex: "1 1 20.6rem", padding: ".3em" }}>
                <div className="text-secondary">
                    <small>#{lawCoverage.LawID} {lawCoverage.LawNum}</small>
                </div>
                <div className="text-secondary" style={{ lineHeight: "1em" }}>
                    <small><strong>{lawCoverage.LawTitle}</strong></small>
                </div>


                <div className="d-flex flex-row align-items-center flex-wrap">

                    <LawCoverageInfoCard
                        status={convertStatus(getOriginalLawStatus(lawCoverage))}
                        header={
                            <span>Orig</span>
                        }
                        date={lawCoverage.updateDate}
                    />

                    <div className="d-flex flex-column" style={{ flex: "1 0 1rem" }}>
                        <div style={{ textAlign: "center" }}>
                            {lawCoverage.originalLaw?.ok && (
                                <small><FontAwesomeIcon icon="arrow-right" /></small>
                            )}
                        </div>
                    </div>

                    <LawCoverageInfoCard
                        status={convertStatus(getRenderedHTMLStatus(lawCoverage))}
                        header={
                            <span>HTML</span>
                        }
                        date={lawCoverage.updateDate}
                    />

                    <div className="d-flex flex-column" style={{ flex: "1 0 1rem" }}>
                        <div style={{ textAlign: "center" }}>
                            {lawCoverage.renderedHTML?.ok && (
                                <small><FontAwesomeIcon icon="arrow-right" /></small>
                            )}
                        </div>
                    </div>

                    <LawCoverageInfoCard
                        status={convertStatus(getRenderedDocxStatus(lawCoverage))}
                        header={
                            <span>Docx</span>
                        }
                        date={lawCoverage.updateDate}
                    />

                    <div className="d-flex flex-column" style={{ flex: "1 0 1rem" }}>
                        <div style={{ textAlign: "center" }}>
                            {lawCoverage.renderedDocx?.ok && (
                                <small><FontAwesomeIcon icon="arrow-right" /></small>
                            )}
                        </div>
                    </div>

                    <LawCoverageInfoCard
                        status={convertStatus(getRenderedLawtextStatus(lawCoverage))}
                        header={
                            <span>Render</span>
                        }
                        date={lawCoverage.updateDate}
                    />

                    <div className="d-flex flex-column" style={{ flex: "1 0 1rem" }}>
                        <div style={{ textAlign: "center" }}>
                            {lawCoverage.renderedLawtext?.ok && (
                                <small><FontAwesomeIcon icon="arrow-right" /></small>
                            )}
                        </div>
                    </div>

                    <LawCoverageInfoCard
                        status={convertStatus(getParsedLawStatus(lawCoverage))}
                        header={
                            <span>Parse</span>
                        }
                        date={lawCoverage.updateDate}
                    />

                    <div className="d-flex flex-column" style={{ flex: "1 0 1rem" }}>
                        <div style={{ textAlign: "center" }}>
                            {lawCoverage.parsedLaw?.ok && (
                                <small><FontAwesomeIcon icon="arrow-right" /></small>
                            )}
                        </div>
                    </div>

                    <LawCoverageInfoCard
                        status={convertStatus(getLawDiffStatus(lawCoverage))}
                        header={
                            <span>Diff</span>
                        }
                        date={lawCoverage.updateDate}
                    />

                </div>
            </div>
        </LawCoverageListItemTag>
    );
};

const LawCoverageListTag = styled.div`
`;

const LawCoverageListItemWrapperTag = styled.div`
    border-top: 1px solid #dee2e6;
    padding: .3em;
    cursor: pointer;
    &:hover {
        background-color: #f8f9fa;
    }
    &:active {
        background-color: #e9ecef;
    }
`;

const LawCoverageList: React.FC<LawtextDashboardPageStateStruct & {lawCoveragesStruct: LawCoveragesStruct}> = props => {

    const { lawCoveragesStruct } = props;

    const listItemOnClick = React.useMemo(() => (lawCoverage: LawCoverage) => {
        location.hash = `/${lawCoverage.LawID}`;
    }, []);

    return (
        <LawCoverageListTag className="d-flex flex-column">
            {lawCoveragesStruct.lawCoverages.map((lawCoverage, i) =>
                <LawCoverageListItemWrapperTag key={i} onClick={() => listItemOnClick(lawCoverage)}>
                    <LawCoverageListItem
                        lawCoverage={lawCoverage} {...props} />
                </LawCoverageListItemWrapperTag>,
            )}
        </LawCoverageListTag>
    );
};


const LawCoverageListPaginatorTag = styled.div`
    border-top: 1px solid #dee2e6;
    height: 2.5em;
`;

const LawCoverageListPaginator: React.FC<LawtextDashboardPageStateStruct & {lawCoveragesStruct: LawCoveragesStruct | null}> = props => {

    const { origSetState } = props;
    const counts = useLawCoverageCounts(props);

    const onClickLeft = React.useMemo(() => () => {
        origSetState(s => {
            const from = Math.max(0, s.filterInfo.from - s.itemsPerPage);
            const to = from + s.itemsPerPage - 1;
            return {
                ...s,
                filterInfo: {
                    ...s.filterInfo,
                    from,
                    to,
                },
            };
        });
    }, [origSetState]);

    const onClickRight = React.useMemo(() => () => {
        origSetState(s => {
            const from = s.filterInfo.from + s.itemsPerPage;
            const to = from + s.itemsPerPage - 1;
            return {
                ...s,
                filterInfo: {
                    ...s.filterInfo,
                    from,
                    to,
                },
            };
        });
    }, [origSetState]);

    return (
        <LawCoverageListPaginatorTag className="d-flex flex-row">
            <button
                className="btn btn-lg btn-light"
                style={{ borderRadius: 0, padding: 0, flex: "1 1" }}
                onClick={onClickLeft}
            >
                <FontAwesomeIcon icon="arrow-alt-circle-left" />
            </button>

            <div style={{ padding: "0 1em 0 1em", textAlign: "center", lineHeight: "1em", flex: "0 0 7em" }}>
                <small>{props.origState.filterInfo.from} ～ {props.origState.filterInfo.to}</small>
                {counts && <>
                    <hr style={{ margin: 0 }} />
                    <small>{Object.values(counts.OriginalLawStatus).reduce((a, b) => a + b, 0)}</small>
                </>}
            </div>

            <button
                className="btn btn-lg btn-light"
                style={{ borderRadius: 0, padding: 0, flex: "1 1" }}
                onClick={onClickRight}
            >
                <FontAwesomeIcon icon="arrow-alt-circle-right" />
            </button>
        </LawCoverageListPaginatorTag>
    );
};


const SidePanelTag = styled.div`
    flex: 0 0 34rem;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #dee2e6;
`;

const SidePanelTop = styled.div`
    flex: 0 0;
`;

const Scroll = styled.div`
    flex: 1 1;
    overflow-y: scroll;
`;

const SidePanelBottom = styled.div`
    flex: 0 0;
`;

export const SidePanel: React.FC<LawtextDashboardPageStateStruct> = props => {
    const lawCoveragesStruct = useLawCoveragesStruct(props);
    return (
        <SidePanelTag>
            <SidePanelTop>
                <FilterControl {...props} />
            </SidePanelTop>
            <Scroll>
                {lawCoveragesStruct &&
                    <LawCoverageList {...props} lawCoveragesStruct={lawCoveragesStruct} />
                }
            </Scroll>
            <SidePanelBottom>
                <LawCoverageListPaginator {...props} lawCoveragesStruct={lawCoveragesStruct} />
            </SidePanelBottom>
        </SidePanelTag>
    );
};

export default SidePanel;
