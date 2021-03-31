import React from "react";
import styled from "styled-components";
import { Sidebar } from "./Sidebar";
import { useLawtextAppPageState } from "./LawtextAppPageState";
import { Viewer } from "./Viewer";
import { ErrorModalID, openFileInputChange, OpenFileInputName, refreshDisplayLaw } from "@appsrc/actions";
import { RouteComponentProps, useParams } from "react-router";

interface RouteParams {
    lawSearchKey: string | undefined,
}
export type RouteState = RouteComponentProps<RouteParams>;

const SideBarDiv = styled.div`
    position: fixed;
    width: 280px;
    top: 0;
    bottom: 0;
    left: 0;
    background-color: rgb(243, 243, 243);

    display: flex;
`;

const ViewerDiv = styled.div`
    margin-left: 280px;
`;

const HiddenInput = styled.input`
    display: none;
`;

export const LawtextAppPage: React.FC = () => {

    const { lawSearchKey } = useParams<RouteParams>();

    const stateStruct = useLawtextAppPageState(lawSearchKey ?? "");
    const { origState, setState } = stateStruct;

    React.useEffect(() => {
        document.title = "Lawtext";
    }, []);

    React.useEffect(() => {
        refreshDisplayLaw(origState, setState);
    }, [origState, setState]);

    return (
        <div>
            <HiddenInput
                name={OpenFileInputName}
                type="file"
                accept="text/plain,application/xml"
                onChange={e => openFileInputChange(setState, e)}
            />

            <SideBarDiv>
                <Sidebar {...stateStruct} />
            </SideBarDiv>

            <ViewerDiv>
                <Viewer {...stateStruct} />
            </ViewerDiv>

            <div
                className="modal fade"
                id={ErrorModalID}
                role="dialog"
                aria-labelledby="errorModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="errorModalLabel" />
                            <button
                                type="button"
                                className="close"
                                data-dismiss="modal"
                                aria-label="Close"
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body" />
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-dismiss="modal"
                            >
                                    閉じる
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
