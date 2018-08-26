import { Action } from 'typescript-fsa';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { History } from 'history';

import { LawtextAppPageActions } from '../actions';
import { AppState } from '../store';
import { LawtextAppPage } from '../components/LawtextAppPage';
import * as states from '../states';






export interface Dispatchers {
    openFile: () => Action<void>,
    openFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    modifyState: (state: Partial<states.LawtextAppPageState>) => Action<Partial<states.LawtextAppPageState>>,

    invokeError: (params: { title: string, bodyEl: string }) => Action<{ title: string, bodyEl: string }>,
    loadLawText: (params: { text: string, analyzeXml: boolean }) => Action<{ text: string, analyzeXml: boolean }>,
    searchLaw: (lawSearchKey: string, history: History) => void,
    downloadDocx: (downloadSelection?: boolean) => void,
    downloadLawtext: () => void,
    downloadXml: () => void,
    scrollLaw: (params: { tag: string, name: string }) => Action<{ tag: string, name: string }>,
}

function mapDispatchToProps(dispatch: Dispatch<Action<any>>) {
    return {

        openFile: () =>
            dispatch(LawtextAppPageActions.openFile()),

        openFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) =>
            states.openFileInputChange(dispatch, event),

        modifyState: (state: Partial<states.LawtextAppPageState>) =>
            dispatch(LawtextAppPageActions.modifyState(state)),

        invokeError: (params: { title: string, bodyEl: string }) =>
            dispatch(LawtextAppPageActions.invokeError(params)),

        loadLawText: (params: { text: string, analyzeXml: boolean }) =>
            dispatch(LawtextAppPageActions.loadLawText(params)),

        searchLaw: (lawSearchKey: string, history?: History) =>
            states.searchLaw(dispatch, lawSearchKey, history),

        downloadDocx: (downloadSelection: boolean = false) =>
            states.downloadDocx(dispatch, downloadSelection),

        downloadLawtext: () =>
            states.downloadLawtext(dispatch),

        downloadXml: () =>
            states.downloadXml(dispatch),

        scrollLaw: (params: { tag: string, name: string }) =>
            dispatch(LawtextAppPageActions.scrollLaw(params)),

    };
}



function mapStateToProps(appState: AppState, routeState: states.RouteState) {
    let overwriteState: Partial<states.LawtextAppPageState> = {};
    console.log(routeState);
    if (routeState.match.params.lawSearchKey) {
        overwriteState.lawSearchKey = routeState.match.params.lawSearchKey;
    }
    return Object.assign({}, appState.lawtextAppPage, overwriteState);
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(LawtextAppPage));

