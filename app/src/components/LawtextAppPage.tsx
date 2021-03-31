import React from "react";
import styled from "styled-components";
import { Sidebar } from "./Sidebar";
import { useLawtextAppPageState } from "./LawtextAppPageState";
import { Viewer } from "./Viewer";
import { onNavigated } from "@appsrc/actions/onNavigated";
import { OpenFileInputName, readFileInput } from "@appsrc/actions/openFile";
import { ErrorModalID } from "@appsrc/actions/showErrorModal";
import { storeTempLaw } from "@appsrc/actions/temp_law";


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

    const stateStruct = useLawtextAppPageState();
    const { setState, history, lawSearchKey } = stateStruct;

    React.useEffect(() => {
        document.title = "Lawtext";
    }, []);

    React.useEffect(() => {
        onNavigated(lawSearchKey, setState);
    }, [lawSearchKey, setState]);

    const inputChanged = async () => {
        setState({ loadingLaw: true, loadingLawMessage: "ファイルを読み込んでいます..." });
        console.log("openFileInputChange: Loading file");
        const text = await readFileInput();
        if (!text) {
            setState({ loadingLaw: false, loadingLawMessage: "" });
            return;
        }
        const id = storeTempLaw(text);
        history.push(`/${id}`);
    };

    return (
        <div>
            <HiddenInput
                name={OpenFileInputName}
                type="file"
                accept="text/plain,application/xml"
                onChange={inputChanged}
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
