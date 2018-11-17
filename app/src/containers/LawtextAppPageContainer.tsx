import { History } from 'history';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Action } from 'typescript-fsa';

import { LawtextAppPageActions } from '../actions';
import { LawtextAppPage } from '../components/LawtextAppPage';
import * as states from '../states';
import { AppState } from '../store';






export interface Dispatchers {
    modifyState: (state: Partial<states.LawtextAppPageState>) => Action<Partial<states.LawtextAppPageState>>,
    openFile: () => void,
    openFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    invokeError: (title: string, bodyEl: string) => void,
    loadLawText: (text: string, analyzeXml: boolean) => void,
    searchLaw: (lawSearchKey: string) => void,
    downloadDocx: (downloadSelection?: boolean) => void,
    downloadLawtext: () => void,
    downloadXml: () => void,
    scrollLaw: (id: string) => void,
    downloadSampleLawtext: () => void,
}

const mapDispatchToProps = (dispatch: Dispatch<Action<any>>) => {
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

        searchLaw: (lawSearchKey: string) =>
            states.searchLaw(dispatch, lawSearchKey),

        downloadDocx: (downloadSelection: boolean = false) =>
            states.downloadDocx(dispatch, downloadSelection),

        downloadLawtext: () =>
            states.downloadLawtext(dispatch),

        downloadXml: () =>
            states.downloadXml(dispatch),

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

