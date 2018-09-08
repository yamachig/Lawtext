import { createStore, combineReducers } from 'redux';
import { LawtextAppPageReducer, LawtextAppPageState } from './states';



export type AppState = {
    lawtextAppPage: LawtextAppPageState,
};

export const store = createStore(
    combineReducers<AppState>({
        lawtextAppPage: LawtextAppPageReducer
    }),
);

export default store;
