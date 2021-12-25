import { LawCoverage, LawType } from "../../lawCoverage";
import { ComparableEL, TagType } from "lawtext/dist/src/diff/law_diff";
import { EL, xmlToJson } from "lawtext/dist/src/util";
import React from "react";
import { useHistory } from "react-router";
import { filtered, FilterInfo, LawDiffStatus, OriginalLawStatus, ParsedLawStatus, RenderedLawtextStatus, SortDirection, sorted, SortKey } from "./FilterInfo";
import { useParams } from "react-router-dom";

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

export interface BaseLawtextDashboardPageState {
    loading: boolean,
    allLawCoveragesLoaded: boolean,
    allLawCoverages: LawCoverage[],
    lawCoverages: LawCoverage[],
    detailLawCoverage: LawCoverage | null,
    page: number,
    filterInfo: FilterInfo,
}

const getInitialState = (): BaseLawtextDashboardPageState => ({
    loading: true,
    allLawCoveragesLoaded: false,
    allLawCoverages: [],
    lawCoverages: [],
    detailLawCoverage: null,
    page: 0,
    filterInfo: {
        sort: [
            [SortKey.RenderedLawtextStatus, SortDirection.Asc],
            [SortKey.ParsedLawStatus, SortDirection.Asc],
            [SortKey.LawDiffStatus, SortDirection.Asc],
            [SortKey.LawType, SortDirection.Asc],
            [SortKey.LawNum, SortDirection.Desc],
        ],
        filter: {
            lawType: new Set(Object.values(LawType)),
            originalLawStatus: new Set(Object.values(OriginalLawStatus)),
            renderedLawtextStatus: new Set(Object.values(RenderedLawtextStatus)),
            parsedLawStatus: new Set(Object.values(ParsedLawStatus)),
            lawDiffStatus: new Set(Object.values(LawDiffStatus)),
        },
    },
});
export type SetLawtextDashboardPageState = (newState: Partial<BaseLawtextDashboardPageState>) => void;
export type OrigSetLawtextDashboardPageState = React.Dispatch<React.SetStateAction<BaseLawtextDashboardPageState>>;

interface RouteParams {
    LawID: string | undefined,
}

export interface LawtextDashboardPageStateStruct {
    origState: Readonly<BaseLawtextDashboardPageState>,
    origSetState: OrigSetLawtextDashboardPageState,
    setState: SetLawtextDashboardPageState,
    history: ReturnType<typeof useHistory>,
    onNavigated: () => void,
    modifyFilterInfo: (filterInfo: FilterInfo) => void,
    routeParams: RouteParams,
}


const ensureAllLawCoverages = async (stateStruct: LawtextDashboardPageStateStruct) => {
    if (!stateStruct.origState.allLawCoveragesLoaded) {

        stateStruct.origSetState(s => ({
            ...s,
            loading: true,
        }));

        const response = await fetch("./lawCoverages");
        const allLawCoverages = await response.json() as LawCoverage[];

        stateStruct.origSetState(s => ({
            ...s,
            lawCoverages: _filterLawCoverages(allLawCoverages, stateStruct.origState.filterInfo),
            allLawCoverages,
            allLawCoveragesLoaded: true,
            loading: false,
        }));

    }
};

const _filterLawCoverages = (
    allLawCoverages: LawCoverage[],
    filterInfo: FilterInfo,
): LawCoverage[] => {
    const lawCoverages = sorted(
        filtered(
            allLawCoverages,
            filterInfo.filter,
        ),
        filterInfo.sort,
    );

    return lawCoverages;
};


const _modifyFilterInfo = (
    origState: BaseLawtextDashboardPageState,
    origSetState: OrigSetLawtextDashboardPageState,
    filterInfo: FilterInfo,
) => {
    origSetState(s => ({
        ...s,
        filterInfo,
        lawCoverages: _filterLawCoverages(origState.allLawCoverages, filterInfo),
    }));
};

const ensureDetailLawCoverage = async (stateStruct: LawtextDashboardPageStateStruct) => {

    if (stateStruct.routeParams.LawID !== null) {
        if (!stateStruct.origState.detailLawCoverage || stateStruct.origState.detailLawCoverage.LawID !== stateStruct.routeParams.LawID) {

            stateStruct.origSetState(s => ({
                ...s,
                detailLawCoverage: null,
                loading: true,
            }));

            const response = await fetch(`./lawCoverage/${stateStruct.routeParams.LawID}`);
            let lawCoverage: LawCoverage | null = null;
            if (response.ok) {
                lawCoverage = await response.json() as LawCoverage;
            }

            stateStruct.origSetState(s => ({
                ...s,
                detailLawCoverage: lawCoverage,
                loading: false,
            }));
        }
    }
};

const _onNavigated = async (stateStruct: LawtextDashboardPageStateStruct) => {
    console.log(`states.onNavigate(${JSON.stringify(stateStruct.routeParams)})`);

    await ensureAllLawCoverages(stateStruct);

    await ensureDetailLawCoverage(stateStruct);
};

export const useLawtextDashboardPageState = (): LawtextDashboardPageStateStruct => {
    const routeParams = useParams<RouteParams>();

    const [state, origSetState] = React.useState<BaseLawtextDashboardPageState>(getInitialState);

    const setState = React.useMemo(
        () => (newState: Partial<BaseLawtextDashboardPageState>) => {
            origSetState(prevState => ({ ...prevState, ...newState }));
        },
        [origSetState],
    );
    const history = useHistory();

    const onNavigated = () => _onNavigated(stateStruct);

    const modifyFilterInfo = (filterInfo: FilterInfo) => _modifyFilterInfo(state, origSetState, filterInfo);

    const stateStruct = {
        origState: state,
        origSetState,
        setState,
        history,
        onNavigated,
        modifyFilterInfo,
        routeParams,
    };


    return stateStruct;
};
