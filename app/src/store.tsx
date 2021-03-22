import { combineReducers, createStore, Store, AnyAction } from "redux";
import { LawtextAppPageReducer, LawtextAppPageState } from "./states";

export interface AppState {
    lawtextAppPage: LawtextAppPageState,
}

export const store = createStore(
    combineReducers<AppState>({
        lawtextAppPage: LawtextAppPageReducer,
    }),
) as Store<AppState, AnyAction>;

if (!LawtextAppPageReducer) throw new Error("!LawtextAppPageReducer");

export default store;
