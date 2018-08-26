import { LawtextAppPageState } from '../states'
import actionCreatorFactory from 'typescript-fsa';

export enum ActionTypes {
    OPEN_FILE = 'OPEN_FILE',

    MODIFY_STATE = '',

    INVOKE_ERROR = 'INVOKE_ERROR',
    LOAD_LAW_TEXT = 'LOAD_LAW_TEXT',
    SCROLL_LAW = 'SCROLL_LAW',
};

const ac = actionCreatorFactory();

export const LawtextAppPageActions = {

    openFile: ac(ActionTypes.OPEN_FILE),

    modifyState: ac<Partial<LawtextAppPageState>>(ActionTypes.MODIFY_STATE),

    invokeError: ac<{ title: string, bodyEl: string }>(ActionTypes.INVOKE_ERROR),

    loadLawText: ac<{ text: string, analyzeXml: boolean }>(ActionTypes.LOAD_LAW_TEXT),

    scrollLaw: ac<{ tag: string, name: string }>(ActionTypes.SCROLL_LAW),

};
