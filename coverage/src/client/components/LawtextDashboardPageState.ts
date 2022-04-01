import { LawCoverage, LawCoverageCounts, toSortString } from "../../lawCoverage";
import { ComparableEL, TagType } from "lawtext/dist/src/diff/law_diff";
import { EL, xmlToJson } from "lawtext/dist/src/node/el";
import React from "react";
import { FilterInfo, filterInfoEqual, SortDirection, SortKey } from "./FilterInfo";
import { useParams, useNavigate } from "react-router-dom";

const domParser = new DOMParser();

export class LawXMLData {
    public dom: XMLDocument;
    public el: EL;
    public root: ComparableEL;
    public els: Array<[ComparableEL, TagType]>;
    constructor(xml: string) {
        this.dom = domParser.parseFromString(xml, "text/xml");
        this.el = xmlToJson(xml);
        this.root = new ComparableEL(this.el);
        this.els = [...this.root.allList()];
    }
}

export interface LawCoveragesStruct {
    filterInfo: FilterInfo,
    lawCoverages: LawCoverage[]
}

export interface BaseLawtextDashboardPageState {
    loading: number,
    fetchingStatus: {
        lawCoverageCounts: boolean,
        lawCoverages: FilterInfo | null,
        detailLawCoverage: string | null,
    },

    lawCoverageCounts: LawCoverageCounts | null,

    lawCoveragesStruct: LawCoveragesStruct | null,
    itemsPerPage: number,
    filterInfo: FilterInfo,

    detailLawCoverageStruct: {
        LawID: string,
        lawCoverage: LawCoverage,
    } | null,
}

const ITEMS_PER_PAGE = 5;

const getInitialState = (): BaseLawtextDashboardPageState => ({
    loading: 0,
    fetchingStatus: {
        lawCoverageCounts: false,
        lawCoverages: null,
        detailLawCoverage: null,
    },

    lawCoverageCounts: null,

    lawCoveragesStruct: null,
    itemsPerPage: ITEMS_PER_PAGE,
    filterInfo: {
        from: 0,
        to: ITEMS_PER_PAGE - 1,
        sort: [
            [SortKey.RenderedLawtextStatus, SortDirection.Asc],
            [SortKey.ParsedLawStatus, SortDirection.Asc],
            [SortKey.LawDiffStatus, SortDirection.Asc],
            [SortKey.LawType, SortDirection.Asc],
            [SortKey.LawNum, SortDirection.Desc],
        ],
        // filter: {
        //     lawType: new Set(Object.values(LawType)),
        //     originalLawStatus: new Set(Object.values(OriginalLawStatus)),
        //     renderedLawtextStatus: new Set(Object.values(RenderedLawtextStatus)),
        //     parsedLawStatus: new Set(Object.values(ParsedLawStatus)),
        //     lawDiffStatus: new Set(Object.values(LawDiffStatus)),
        // },
    },

    detailLawCoverageStruct: null,

});
export type SetLawtextDashboardPageState = (newState: Partial<BaseLawtextDashboardPageState>) => void;
export type OrigSetLawtextDashboardPageState = React.Dispatch<React.SetStateAction<BaseLawtextDashboardPageState>>;

interface RouteParams {
    LawID: string | undefined,
    [key: string]: string | undefined,
}

export interface LawtextDashboardPageStateStruct {
    origState: Readonly<BaseLawtextDashboardPageState>,
    origSetState: OrigSetLawtextDashboardPageState,
    setState: SetLawtextDashboardPageState,
    history: ReturnType<typeof useNavigate>,
    onNavigated: () => void,
    routeParams: RouteParams,
}

export const useLawCoverageCounts = (stateStruct: LawtextDashboardPageStateStruct) => {
    const { origSetState, origState } = stateStruct;
    const { lawCoverageCounts } = origState;

    React.useEffect(() => {
        if (lawCoverageCounts) return;

        origSetState(stateBeforeJob => {
            if (stateBeforeJob.fetchingStatus.lawCoverageCounts) return stateBeforeJob;
            job();
            return {
                ...stateBeforeJob,
                fetchingStatus: {
                    ...stateBeforeJob.fetchingStatus,
                    lawCoverageCounts: true,
                },
                lawCoverageCounts: null,
                loading: stateBeforeJob.loading + 1,
            };
        });

        const job = async () => {
            console.log(`[${new Date().toISOString()}] fetching lawCoverageCounts...`);

            const response = await fetch("./lawCoverageCounts");
            const lawCoverageCounts = await response.json() as LawCoverageCounts;

            origSetState(stateAfterJob => ({
                ...stateAfterJob,
                fetchingStatus: {
                    ...stateAfterJob.fetchingStatus,
                    lawCoverageCounts: false,
                },
                lawCoverageCounts,
                loading: stateAfterJob.loading - 1,
            }));

            console.log(`[${new Date().toISOString()}] fetching lawCoverageCounts finished.`);
        };

    }, [lawCoverageCounts, origSetState, origState.fetchingStatus.lawCoverageCounts]);

    return lawCoverageCounts;
};

export const useLawCoveragesStruct = (stateStruct: LawtextDashboardPageStateStruct) => {

    React.useEffect(() => {
        const { origSetState } = stateStruct;

        origSetState(stateBeforeJob => {
            if (
                stateBeforeJob.lawCoveragesStruct
                && filterInfoEqual(stateBeforeJob.filterInfo, stateBeforeJob.lawCoveragesStruct.filterInfo)
            ) return stateBeforeJob;
            if (
                stateBeforeJob.fetchingStatus.lawCoverages
                && filterInfoEqual(stateBeforeJob.filterInfo, stateBeforeJob.fetchingStatus.lawCoverages)
            ) return stateBeforeJob;

            (async () => {
                console.log(`[${new Date().toISOString()}] fetching lawCoverages...`);

                const response = await fetch(`./lawCoverages/index/${stateBeforeJob.filterInfo.from}-${stateBeforeJob.filterInfo.to}/sort/${toSortString(stateBeforeJob.filterInfo.sort)}`);
                const lawCoverages = await response.json() as LawCoverage[];

                origSetState(stateAfterJob => {
                    if (stateAfterJob.fetchingStatus.lawCoverages && filterInfoEqual(stateBeforeJob.filterInfo, stateAfterJob.fetchingStatus.lawCoverages)) {
                        console.log(`[${new Date().toISOString()}] fetching lawCoverages finished.`);
                        return {
                            ...stateAfterJob,
                            fetchingStatus: {
                                ...stateAfterJob.fetchingStatus,
                                lawCoverages: null,
                            },
                            lawCoveragesStruct: {
                                filterInfo: stateBeforeJob.filterInfo,
                                lawCoverages,
                            },
                            loading: stateAfterJob.loading - 1,
                        };
                    } else {
                        console.log(`[${new Date().toISOString()}] fetching lawCoverages finished. (ignored)`);
                        return {
                            ...stateAfterJob,
                            loading: stateAfterJob.loading - 1,
                        };
                    }
                });
            })();

            return {
                ...stateBeforeJob,
                fetchingStatus: {
                    ...stateBeforeJob.fetchingStatus,
                    lawCoverages: stateBeforeJob.filterInfo,
                },
                lawCoveragesStruct: null,
                loading: stateBeforeJob.loading + 1,
            };
        });
    }, [stateStruct, stateStruct.origSetState, stateStruct.origState.filterInfo]);

    return stateStruct.origState.lawCoveragesStruct;
};

export const useDetailLawCoverageStruct = (stateStruct: LawtextDashboardPageStateStruct) => {

    React.useEffect(() => {
        const { origSetState } = stateStruct;
        const { LawID } = stateStruct.routeParams;

        origSetState(stateBeforeJob => {
            if (!LawID) return stateBeforeJob;
            if (stateBeforeJob.detailLawCoverageStruct && stateBeforeJob.detailLawCoverageStruct.LawID === LawID) return stateBeforeJob;
            if (stateBeforeJob.fetchingStatus.detailLawCoverage === LawID) return stateBeforeJob;

            (async () => {
                console.log(`[${new Date().toISOString()}] fetching detailLawCoverage...`);

                const response = await fetch(`./lawCoverage/${stateStruct.routeParams.LawID}`);
                const lawCoverage = await response.json() as LawCoverage;

                origSetState(stateAfterJob => {
                    if (stateAfterJob.fetchingStatus.detailLawCoverage === LawID) {
                        console.log(`[${new Date().toISOString()}] fetching detailLawCoverage finished.`);
                        return {
                            ...stateAfterJob,
                            fetchingStatus: {
                                ...stateAfterJob.fetchingStatus,
                                detailLawCoverage: null,
                            },
                            detailLawCoverageStruct: {
                                LawID,
                                lawCoverage,
                            },
                            loading: stateAfterJob.loading - 1,
                        };

                    } else {
                        console.log(`[${new Date().toISOString()}] fetching detailLawCoverage finished. (ignored)`);
                        return {
                            ...stateAfterJob,
                            loading: stateAfterJob.loading - 1,
                        };
                    }
                });
            })();

            return {
                ...stateBeforeJob,
                fetchingStatus: {
                    ...stateBeforeJob.fetchingStatus,
                    detailLawCoverage: LawID,
                },
                detailLawCoverage: null,
                loading: stateBeforeJob.loading + 1,
            };
        });

    }, [stateStruct, stateStruct.routeParams.LawID]);

    return stateStruct.origState.detailLawCoverageStruct;
};

const _onNavigated = async (stateStruct: LawtextDashboardPageStateStruct) => {
    console.log(`states.onNavigate(${JSON.stringify(stateStruct.routeParams)})`);
};

export const useLawtextDashboardPageState = (): LawtextDashboardPageStateStruct => {
    const routeParams = useParams<RouteParams>() as RouteParams;

    const [state, origSetState] = React.useState<BaseLawtextDashboardPageState>(getInitialState);

    const setState = React.useMemo(
        () => (newState: Partial<BaseLawtextDashboardPageState>) => {
            origSetState(prevState => ({ ...prevState, ...newState }));
        },
        [origSetState],
    );
    const history = useNavigate();

    const onNavigated: () => void = () => _onNavigated(stateStruct);

    const stateStruct = {
        origState: state,
        origSetState,
        setState,
        history,
        onNavigated,
        routeParams,
    };

    return stateStruct;
};
