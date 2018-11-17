import { UnregisterCallback } from "history";
import * as $ from "jquery";
import * as React from "react";
import styled from 'styled-components';
import { Dispatchers } from '../containers/LawtextAppPageContainer';
import { LawtextAppPageState, RouteState, SelectionRange } from '../states';
import { Sidebar } from './Sidebar';
import { Viewer } from './Viewer';


type Props = LawtextAppPageState & Dispatchers & RouteState;

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

const OpenFileInputName = "LawtextAppPage.OpenFileInput";
export const openFile = () => {
    const els = document.getElementsByName(OpenFileInputName);
    if (els) {
        els[0].click();
    }
}

const ErrorModalID = "LawtextAppPage.ErrorModal";
export const showErrorModal = (title: string, bodyEl: string) => {
    const modalEl = document.getElementById(ErrorModalID);
    if (!modalEl) return;
    const modal = $(modalEl) as JQuery<HTMLElement> & { modal: (method: string) => any };
    modal.find(".modal-title").html(title);
    modal.find(".modal-body").html(bodyEl);
    modal.modal("show");
}

export const tobeDownloadedRange = (): SelectionRange | null => {
    const getPos = (node: Node) => {
        if (!node.parentNode) return null;
        const el = $(node.parentNode as HTMLElement);

        const containerEl = el.data("container_info")
            ? el
            : el.closest("[data-container_info]");
        if (!containerEl) return null;
        const containerInfo = containerEl.data("container_info");

        const toplevelContainerEl = containerEl.closest("[data-toplevel_container_info]");
        if (!toplevelContainerEl) return null;
        const toplevelContainerInfo = toplevelContainerEl.data("toplevel_container_info");

        return {
            container_tag: toplevelContainerInfo.tag,
            container_id: toplevelContainerInfo.id,
            item_tag: containerInfo.tag,
            item_id: containerInfo.id,
        }
    };

    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    const sPos = getPos(range.startContainer);
    const ePos = getPos(range.endContainer);
    if (!sPos || !ePos) return null;

    return {
        start: sPos,
        end: ePos,
    };
}


export const scrollToLawAnchor = (id: string) => {
    for (const el of Array.from(document.getElementsByClassName("law-anchor"))) {
        if ((el as HTMLElement).dataset.el_id === id) {
            const offset = $(el).offset();
            if (offset) $("html,body").animate({ scrollTop: offset.top }, "normal");
        }
    }
}

export class LawtextAppPage extends React.Component<Props> {
    public unsubscribeFromHistory?: UnregisterCallback;
    public componentWillMount() {
        this.onNavigate();
        this.unsubscribeFromHistory = this.props.history.listen(() => this.onNavigate());
    }

    public componentWillUnmount() {
        if (this.unsubscribeFromHistory) this.unsubscribeFromHistory();
    }

    public onNavigate() {
        console.log(`onNavigate: before timer:`, this.props.lawSearchKey);
        setTimeout(() => {
            console.log(`onNavigate: after timer:`, this.props.lawSearchKey);
            if (this.props.lawSearchKey) {
                this.props.searchLaw(this.props.lawSearchKey);
            }
        }, 30);
    }

    public render() {
        return (
            <div>
                <HiddenInput
                    name={OpenFileInputName}
                    type="file"
                    accept="text/plain,application/xml"
                    onChange={this.props.openFileInputChange}
                />

                <SideBarDiv>
                    <Sidebar {...this.props} />
                </SideBarDiv>

                <ViewerDiv>
                    <Viewer {...this.props} />
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
    }
}