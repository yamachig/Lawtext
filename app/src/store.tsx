import { combineReducers, createStore } from 'redux';
import { LawtextAppPageReducer, LawtextAppPageState } from './states';

export interface AppState {
    lawtextAppPage: LawtextAppPageState,
};

export const store = createStore(
    combineReducers<AppState>({
        lawtextAppPage: LawtextAppPageReducer
    }),
);

if (!LawtextAppPageReducer) throw new Error("!LawtextAppPageReducer");

export default store;