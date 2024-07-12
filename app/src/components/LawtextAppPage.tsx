import React, { useState } from "react";
import styled from "styled-components";
import { Sidebar } from "./Sidebar";
import { useLawtextAppPageState } from "./LawtextAppPageState";
import { Viewer } from "./Viewer";
import { onNavigated } from "@appsrc/actions/onNavigated";
import { OpenFileInputName, readFileInput } from "@appsrc/actions/openFile";
import { ErrorModalID } from "@appsrc/actions/showErrorModal";
import { storeTempLaw } from "@appsrc/actions/temp_law";
import { omit } from "lawtext/dist/src/util";


const ViewerFlexDiv = styled.div`
    display: flex;
    height: 100vh;
`;

const SideBarDiv = styled.div`
    flex: 0 0 280px;
    max-width: 280px;
    background-color: rgb(243, 243, 243);

    display: flex;
`;

const ViewerDiv = styled.div`
    flex: 1 1 auto;
    overflow-y: auto;
`;

const HiddenInput = styled.input`
    display: none;
`;

export const LawtextAppPage: React.FC = () => {

    const stateStruct = useLawtextAppPageState();
    const { navigate, path, origSetState } = stateStruct;

    React.useEffect(() => {
        document.title = "Lawtext";
    }, []);

    const [prevPath, setPrevPath] = useState("");
    React.useEffect(() => {
        if (path !== prevPath) {
            onNavigated(path.trim(), prevPath, origSetState);
            setPrevPath(path);
        }
    }, [path, prevPath, origSetState]);

    const inputChanged = async () => {
        origSetState(s => ({
            ...s,
            loadingLaw: true,
            viewerMessages: {
                ...s.viewerMessages,
                loadingLaw: "ファイルを読み込んでいます...",
            },
        }));
        console.log("openFileInputChange: Loading file");
        const text = await readFileInput();
        if (!text) {
            origSetState(s => ({
                ...s,
                loadingLaw: false,
                viewerMessages: omit(s.viewerMessages, "loadingLaw"),
            }));
            return;
        }
        const id = storeTempLaw(text);
        navigate(`/${id}`);
    };

    return (
        <div>
            <HiddenInput
                name={OpenFileInputName}
                type="file"
                accept="text/plain,application/xml"
                onChange={inputChanged}
            />

            <ViewerFlexDiv>
                <SideBarDiv>
                    <Sidebar {...stateStruct} />
                </SideBarDiv>

                <ViewerDiv className="law-anchor-scroll-box">
                    <Viewer {...stateStruct} />
                </ViewerDiv>
            </ViewerFlexDiv>

            <div
                className="modal fade"
                id={ErrorModalID}
                aria-labelledby="errorModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="errorModalLabel" />
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
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
                                data-bs-dismiss="modal"
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
