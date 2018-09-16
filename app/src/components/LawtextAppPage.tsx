import * as React from "react";
import styled from 'styled-components';
import { Dispatchers } from '../containers/LawtextAppPageContainer';
import { LawtextAppPageState, SelectionRange, RouteState } from '../states';
import { Sidebar } from './Sidebar'
import { Viewer } from './Viewer'
import * as $ from "jquery"
import { UnregisterCallback } from "history";


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
export function openFile() {
    const els = document.getElementsByName(OpenFileInputName);
    if (els) {
        els[0].click();
    }
}

const ErrorModalID = "LawtextAppPage.ErrorModal";
export function showErrorModal(title: string, bodyEl: string) {
    const modalEl = document.getElementById(ErrorModalID);
    if (!modalEl) return;
    const modal = $(modalEl) as JQuery<HTMLElement> & { modal: Function };
    modal.find(".modal-title").html(title);
    modal.find(".modal-body").html(bodyEl);
    modal.modal("show");
}

export function tobeDownloadedRange(): SelectionRange | null {
    const get_pos = (node: Node) => {
        if (!node.parentNode) return null;
        const el = $(node.parentNode as HTMLElement);

        const container_el = el.data("container_info")
            ? el
            : el.closest("[data-container_info]");
        if (!container_el) return null;
        const container_info = container_el.data("container_info");

        const toplevel_container_el = container_el.closest("[data-toplevel_container_info]");
        if (!toplevel_container_el) return null;
        const toplevel_container_info = toplevel_container_el.data("toplevel_container_info");

        return {
            container_tag: toplevel_container_info.tag,
            container_id: toplevel_container_info.id,
            item_tag: container_info.tag,
            item_id: container_info.id,
        }
    };

    let selection = window.getSelection();
    let range = selection.getRangeAt(0);

    let s_pos = get_pos(range.startContainer);
    let e_pos = get_pos(range.endContainer);
    if (!s_pos || !e_pos) return null;

    return {
        start: s_pos,
        end: e_pos,
    };
}


export function scrollToLawAnchor(id: string) {
    for (let el of Array.from(document.getElementsByClassName("law-anchor"))) {
        if ((el as HTMLElement).dataset.el_id === id) {
            let offset = $(el).offset();
            if (offset) $("html,body").animate({ scrollTop: offset.top }, "normal");
        }
    }
}

export class LawtextAppPage extends React.Component<Props> {
    unsubscribeFromHistory?: UnregisterCallback;
    componentWillMount() {
        this.onNavigate();
        this.unsubscribeFromHistory = this.props.history.listen(() => this.onNavigate());
    }

    componentWillUnmount() {
        if (this.unsubscribeFromHistory) this.unsubscribeFromHistory();
    }

    onNavigate() {
        console.log(`onNavigate: before timer:`, this.props.lawSearchKey);
        setTimeout(() => {
            console.log(`onNavigate: after timer:`, this.props.lawSearchKey);
            if (this.props.lawSearchKey) {
                this.props.searchLaw(this.props.lawSearchKey);
            }
        }, 30);
    }

    render() {
        return (
            <div>
                <HiddenInput
                    name={OpenFileInputName}
                    type="file"
                    accept="text/plain,application/xml"
                    onChange={this.props.openFileInputChange}
                >
                </HiddenInput>

                <SideBarDiv>
                    <Sidebar {...this.props}></Sidebar>
                </SideBarDiv>

                <ViewerDiv>
                    <Viewer {...this.props}></Viewer>
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
                                <h5 className="modal-title" id="errorModalLabel"></h5>
                                <button
                                    type="button"
                                    className="close"
                                    data-dismiss="modal"
                                    aria-label="Close"
                                >
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                            </div>
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