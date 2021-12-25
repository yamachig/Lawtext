import { LawCoverage } from "../../lawCoverage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { arrayMove, SortableContainer, SortableElement } from "react-sortable-hoc";
import styled from "styled-components";
import { getLawDiffStatus, getOriginalLawStatus, getParsedLawStatus, getRenderedLawtextStatus, LawDiffStatus, OriginalLawStatus, ParsedLawStatus, RenderedLawtextStatus, SortDirection, SortKey } from "./FilterInfo";
import LawCoverageInfoCard from "./LawCoverageInfoCard";
import { LawtextDashboardPageStateStruct } from "./LawtextDashboardPageState";
import { convertStatus } from "./MainPanel";


interface FilterInfoSortItemProps {
    sort: (
        [SortKey, SortDirection] |
        null |
        SortKey
    ),
    directionButtonClick: () => void;
}

const KeyToName = {
    [SortKey.ID]: "ID",
    [SortKey.LawNum]: "番号",
    [SortKey.LawType]: "種別",
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

export const FilterInfoSortItem = SortableElement((props: FilterInfoSortItemProps) => {
    if (Array.isArray(props.sort)) {
        const [key, dir] = props.sort;
        const ButtonTag = dir === SortDirection.Asc ? ButtonOff : ButtonOn;
        return (
            <ActiveItem>
                <span style={{ verticalAlign: "middle" }}>{KeyToName[key]}</span>
                <ButtonTag onClick={props.directionButtonClick}>
                    <FontAwesomeIcon icon="exchange-alt" style={{ pointerEvents: "none" }} />
                </ButtonTag>
            </ActiveItem>
        );
    } else if (props.sort) {
        const key = props.sort;
        return (
            <RestItem>
                <span style={{ verticalAlign: "middle" }}>{KeyToName[key]}</span>
                <ButtonDummy disabled={true}>
                    <FontAwesomeIcon icon="minus" style={{ pointerEvents: "none" }} />
                </ButtonDummy>
            </RestItem>
        );
    } else {
        return (
            <NullItem>
                <span style={{ verticalAlign: "middle" }}><FontAwesomeIcon icon="arrow-left" /></span>
            </NullItem>
        );
    }
});


interface FilterInfoSortContainerProps {
    sort: Array<
        [SortKey, SortDirection] |
        null |
        SortKey
    >,
    directionButtonClick: (sortKey: SortKey) => void;
}

export const FilterInfoSortContainer = SortableContainer((props: FilterInfoSortContainerProps) => {
    const directionButtonClick = (sort: FilterInfoSortContainerProps["sort"][0]) => () => {
        if (sort) {
            if (Array.isArray(sort)) props.directionButtonClick(sort[0]);
            else props.directionButtonClick(sort);
        }
    };
    return (
        <div className="d-flex flex-row">
            {props.sort.map((sort, i) => (
                <FilterInfoSortItem
                    sort={sort}
                    key={`${sort}`}
                    index={i}
                    directionButtonClick={directionButtonClick(sort)}
                />
            ))}
        </div>
    );
});


class FilterInfoFilterContainerCounter<K> {
        public map: Map<K, number>;
        constructor() {
            this.map = new Map();
        }
        public add(key: K, n: number) {
            this.map.set(key, this.get(key) + n);
        }
        public get(key: K) {
            return this.map.get(key) ?? 0;
        }
}

const FilterInfoFilterContainer: React.FC<{allLawCoveragesLoaded: boolean, allLawCoverages: LawCoverage[]}> = props => {
    const OriginalLawStatusCounter = new FilterInfoFilterContainerCounter<OriginalLawStatus>();
    const RenderedLawtextStatusCounter = new FilterInfoFilterContainerCounter<RenderedLawtextStatus>();
    const ParsedLawStatusCounter = new FilterInfoFilterContainerCounter<ParsedLawStatus>();
    const LawDiffStatusCounter = new FilterInfoFilterContainerCounter<LawDiffStatus>();
    for (const lawCoverage of props.allLawCoverages) {
        OriginalLawStatusCounter.add(getOriginalLawStatus(lawCoverage), 1);
        RenderedLawtextStatusCounter.add(getRenderedLawtextStatus(lawCoverage), 1);
        ParsedLawStatusCounter.add(getParsedLawStatus(lawCoverage), 1);
        LawDiffStatusCounter.add(getLawDiffStatus(lawCoverage), 1);
    }
    return (
        <>
            <div>
                <small style={{ verticalAlign: "middle" }}>
                    Orig:{" "}
                    {OriginalLawStatusCounter.get(OriginalLawStatus.Fail) !== 0 &&
                        <><span className="badge bg-dark">{OriginalLawStatusCounter.get(OriginalLawStatus.Fail)} Fails</span>&nbsp;</>
                    }
                    {OriginalLawStatusCounter.get(OriginalLawStatus.Success) !== 0 &&
                        <><span className="badge bg-success">{OriginalLawStatusCounter.get(OriginalLawStatus.Success)} Success</span>&nbsp;</>
                    }
                    {OriginalLawStatusCounter.get(OriginalLawStatus.Null) !== 0 &&
                        <><span className="badge bg-light text-dark">{OriginalLawStatusCounter.get(OriginalLawStatus.Null)} Null</span>&nbsp;</>
                    }
                </small>
            </div>
            <div>
                <small style={{ verticalAlign: "middle" }}>
                    Rendered:{" "}
                    {RenderedLawtextStatusCounter.get(RenderedLawtextStatus.Fail) !== 0 &&
                        <><span className="badge bg-dark">{RenderedLawtextStatusCounter.get(RenderedLawtextStatus.Fail)} Fails</span>&nbsp;</>
                    }
                    {RenderedLawtextStatusCounter.get(RenderedLawtextStatus.Success) !== 0 &&
                        <><span className="badge bg-success">{RenderedLawtextStatusCounter.get(RenderedLawtextStatus.Success)} Success</span>&nbsp;</>
                    }
                    {RenderedLawtextStatusCounter.get(RenderedLawtextStatus.Null) !== 0 &&
                        <><span className="badge bg-light text-dark">{RenderedLawtextStatusCounter.get(RenderedLawtextStatus.Null)} Null</span>&nbsp;</>
                    }
                </small>
            </div>
            <div>
                <small style={{ verticalAlign: "middle" }}>
                    Parsed:{" "}
                    {ParsedLawStatusCounter.get(ParsedLawStatus.Fail) !== 0 &&
                        <><span className="badge bg-dark">{ParsedLawStatusCounter.get(ParsedLawStatus.Fail)} Fails</span>&nbsp;</>
                    }
                    {ParsedLawStatusCounter.get(ParsedLawStatus.Success) !== 0 &&
                        <><span className="badge bg-success">{ParsedLawStatusCounter.get(ParsedLawStatus.Success)} Success</span>&nbsp;</>
                    }
                    {ParsedLawStatusCounter.get(ParsedLawStatus.Null) !== 0 &&
                        <><span className="badge bg-light text-dark">{ParsedLawStatusCounter.get(ParsedLawStatus.Null)} Null</span>&nbsp;</>
                    }
                </small>
            </div>
            <div>
                <small style={{ verticalAlign: "middle" }}>
                    Diff:{" "}
                    {LawDiffStatusCounter.get(LawDiffStatus.Fail) !== 0 &&
                        <><span className="badge bg-dark">{LawDiffStatusCounter.get(LawDiffStatus.Fail)} Fails</span>&nbsp;</>
                    }
                    {LawDiffStatusCounter.get(LawDiffStatus.Error) !== 0 &&
                        <><span className="badge bg-danger">{LawDiffStatusCounter.get(LawDiffStatus.Error)} Error</span>&nbsp;</>
                    }
                    {LawDiffStatusCounter.get(LawDiffStatus.Warning) !== 0 &&
                        <><span className="badge bg-warning text-dark">{LawDiffStatusCounter.get(LawDiffStatus.Warning)} Warning</span>&nbsp;</>
                    }
                    {LawDiffStatusCounter.get(LawDiffStatus.NoProblem) !== 0 &&
                        <><span className="badge bg-success">{LawDiffStatusCounter.get(LawDiffStatus.NoProblem)} NoProblem</span>&nbsp;</>
                    }
                    {LawDiffStatusCounter.get(LawDiffStatus.Null) !== 0 &&
                        <><span className="badge bg-light text-dark">{LawDiffStatusCounter.get(LawDiffStatus.Null)} Null</span>&nbsp;</>
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

    stateStruct.modifyFilterInfo({
        filter: stateStruct.origState.filterInfo.filter,
        sort: newActiveSort,
    });

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

    stateStruct.modifyFilterInfo({
        filter: stateStruct.origState.filterInfo.filter,
        sort: newActiveSort,
    });
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

    return (
        <FilterControlTag>
            <div>
                <small style={{ verticalAlign: "middle" }}>並び替え：</small>
                <div style={{ display: "inline-block" }}>
                    <FilterInfoSortContainer
                        sort={state.sort}
                        axis="x"
                        onSortEnd={({ oldIndex, newIndex }) => onFilterControlSortEnd(oldIndex, newIndex, props, state, setState)}
                        directionButtonClick={key => filterControlDirectionButtonClick(key, props, state, setState)}
                    />
                </div>
            </div>
            <FilterInfoFilterContainer
                allLawCoveragesLoaded={props.origState.allLawCoveragesLoaded}
                allLawCoverages={props.origState.allLawCoverages}
            />
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
                            <span>Original XML</span>
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
                        status={convertStatus(getRenderedLawtextStatus(lawCoverage))}
                        header={
                            <span>Rendered Lawtext</span>
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
                            <span>Parsed XML</span>
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
                            <span>Difference</span>
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

const LawCoverageList: React.FC<LawtextDashboardPageStateStruct & {itemsPerPage: number}> = props => {

    const listItemOnClick = React.useMemo(() => (lawCoverage: LawCoverage) => {
        location.hash = `${lawCoverage.LawID}`;
    }, []);

    const lawCoverages = props.origState.lawCoverages.slice(
        props.origState.page * props.itemsPerPage,
        props.origState.page * props.itemsPerPage + props.itemsPerPage,
    );

    return (
        <LawCoverageListTag className="d-flex flex-column">
            {lawCoverages.map((lawCoverage, i) =>
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

const LawCoverageListPaginator: React.FC<LawtextDashboardPageStateStruct & {itemsPerPage: number}> = props => {

    const { origSetState } = props;

    const onClickLeft = React.useMemo(() => () => {
        origSetState(s => ({
            ...s,
            page: Math.max(0, s.page - 1),
        }));
    }, [origSetState]);

    const onClickRight = React.useMemo(() => () => {
        origSetState(s => ({
            ...s,
            page: Math.min(
                s.page + 1,
                Math.floor(s.lawCoverages.length / props.itemsPerPage),
            ),
        }));
    }, [origSetState, props.itemsPerPage]);

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
                <small>{props.origState.page * props.itemsPerPage + 1} ～ {(props.origState.page + 1) * props.itemsPerPage}</small>
                <hr style={{ margin: 0 }} />
                <small>{props.origState.lawCoverages.length}</small>
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

const ITEMS_PER_PAGE = 5;

export const SidePanel: React.FC<LawtextDashboardPageStateStruct> = props => {
    return (
        <SidePanelTag>
            <SidePanelTop>
                {props.origState.allLawCoveragesLoaded && <>
                    <FilterControl {...props} />
                </>}
            </SidePanelTop>
            <Scroll>
                {props.origState.allLawCoveragesLoaded &&
                    <LawCoverageList {...props} itemsPerPage={ITEMS_PER_PAGE} />
                }
            </Scroll>
            <SidePanelBottom>
                {props.origState.allLawCoveragesLoaded &&
                    <LawCoverageListPaginator {...props} itemsPerPage={ITEMS_PER_PAGE} />
                }
            </SidePanelBottom>
        </SidePanelTag>
    );
};

export default SidePanel;
