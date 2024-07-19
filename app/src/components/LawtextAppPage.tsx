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
    height: 100vh;
    flex-wrap: unset;
`;

const SideBarDiv = styled.div`
    max-width: 280px;
    padding: unset;
    flex-direction: unset;

    display: flex;
`;

const ViewerDiv = styled.div`
    overflow-y: auto;
    padding: unset;
`;

const HiddenInput = styled.input`
    display: none;
`;

const OffcanvasButtonDiv = styled.div`
    position: fixed;
    top: 0.5rem;
    left: 0.5rem;
    bottom: auto;
    z-index: 100;
    background-color: rgb(255 255 255 / 65%);
    border-radius: 0.5rem;
    padding: 0.2rem;
`;

const OffcanvasButton = styled.button`
    &:not(:active):not(:hover):not(.show) {
        background-color: white;
    }
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

            <div className="container-fluid">
                <ViewerFlexDiv className="row">
                    <SideBarDiv className="col offcanvas-md offcanvas-start" id="sidebarOffcanvas">
                        <Sidebar {...stateStruct} />
                    </SideBarDiv>

                    <ViewerDiv className="col law-anchor-scroll-box">
                        <Viewer {...stateStruct} />
                    </ViewerDiv>
                </ViewerFlexDiv>
            </div>

            <OffcanvasButtonDiv className="d-md-none">
                <OffcanvasButton className="btn btn-outline-secondary" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarOffcanvas" aria-controls="offcanvasResponsive" title="サイドバーの表示を切り替える">
                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30' style={{ display: "inline", width: "1.5em" }}>
                        <path stroke='currentColor' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22' />
                    </svg>
                    <span style={{ verticalAlign: "text-top", marginLeft: "0.25em", fontWeight: 500 }}>Lawtext</span>
                </OffcanvasButton>
            </OffcanvasButtonDiv>

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
