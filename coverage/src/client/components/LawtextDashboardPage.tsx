import * as React from "react";
import styled from "styled-components";
import type { LawtextDashboardPageStateStruct } from "./LawtextDashboardPageState";
import { useLawtextDashboardPageState } from "./LawtextDashboardPageState";
import MainPanel from "./MainPanel";
import SidePanel from "./SidePanel";


const ViewerLoadingTag = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 100;

    padding-top: 1rem;
    text-align: center;

    pointer-events: none;
`;
export const ViewerLoading: React.FC = () => {
    return (
        <ViewerLoadingTag>
            <div className="container-fluid" style={{ textAlign: "right" }}>
                <span className="badge bg-secondary">ロード中です…</span>
            </div>
        </ViewerLoadingTag>
    );
};


const ViewerInitialTag = styled.div`
    display: flex;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
`;

export const ViewerInitial: React.FC<LawtextDashboardPageStateStruct> = props => {
    return (
        <ViewerInitialTag>
            <SidePanel {...props} />
            <MainPanel {...props} />
        </ViewerInitialTag>
    );
};

export const LawtextDashboardPage: React.FC = () => {
    const stateStruct = useLawtextDashboardPageState();

    const { onNavigated, origState, routeParams } = stateStruct;

    React.useEffect(() => {
        onNavigated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routeParams]);

    return (
        <div>
            {(origState.loading > 0) &&
                <ViewerLoading />
            }
            <ViewerInitial {...stateStruct} />
        </div>
    );
};
