import { UnregisterCallback } from "history";
import * as $ from "jquery";
import * as React from "react";
import styled from 'styled-components';
import { Dispatchers } from '../containers/LawtextAppPageContainer';
import { ErrorModalID, LawtextAppPageState, OpenFileInputName, RouteState } from '../states';
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
                this.props.searchLaw(() => this.props, this.props.lawSearchKey);
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
