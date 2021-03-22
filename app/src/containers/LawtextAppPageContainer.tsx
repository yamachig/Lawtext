import { History } from 'history';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Action } from 'typescript-fsa';

import * as std from "@coresrc/std_law"
import { LawtextAppPageActions } from '../actions';
import { LawtextAppPage } from '../components/LawtextAppPage';
import * as states from '../states';
import { AppState } from '../store';






export interface Dispatchers {
    modifyState: (state: Partial<states.LawtextAppPageState>) => Action<Partial<states.LawtextAppPageState>>,
    openFile: () => void,
    openFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>,
    invokeError: (title: string, bodyEl: string) => void,
    loadLawText: (text: string, analyzeXml: boolean) => Promise<std.Law | null>,
    searchLaw: (getState: () => states.LawtextAppPageState, lawSearchKey: string) => Promise<void>,
    downloadDocx: (law: std.Law, downloadSelection?: boolean) => Promise<void>,
    downloadLawtext: (law: std.Law) => Promise<void>,
    downloadXml: (law: std.Law) => Promise<void>,
    scrollLaw: (id: string) => void,
    downloadSampleLawtext: () => Promise<void>,
}

export const mapDispatchToProps = (dispatch: Dispatch<Action<any>>) => {
    return {

        modifyState: (state: Partial<states.LawtextAppPageState>) =>
            dispatch(LawtextAppPageActions.modifyState(state)),

        openFile: () =>
            states.openFile(dispatch),

        openFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) =>
            states.openFileInputChange(dispatch, event),

        invokeError: (title: string, bodyEl: string) =>
            states.invokeError(dispatch, title, bodyEl),

        loadLawText: (text: string, analyzeXml: boolean) =>
            states.loadLawText(dispatch, text, analyzeXml),

        searchLaw: (getState: () => states.LawtextAppPageState, lawSearchKey: string) =>
            states.searchLaw(getState, dispatch, lawSearchKey),

        downloadDocx: (law: std.Law, downloadSelection: boolean = false) =>
            states.downloadDocx(dispatch, law, downloadSelection),

        downloadLawtext: (law: std.Law) =>
            states.downloadLawtext(dispatch, law),

        downloadXml: (law: std.Law) =>
            states.downloadXml(dispatch, law),

        scrollLaw: (id: string) =>
            states.scrollLaw(dispatch, id),

        downloadSampleLawtext: () =>
            states.downloadSampleLawtext(dispatch),

    };
}



const mapStateToProps = (appState: AppState, routeState: states.RouteState) => {
    const overwriteState: Partial<states.LawtextAppPageState> = {};
    if (routeState.match.params.lawSearchKey) {
        overwriteState.lawSearchKey = routeState.match.params.lawSearchKey;
    }
    return Object.assign({}, appState.lawtextAppPage, overwriteState);
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(LawtextAppPage));

