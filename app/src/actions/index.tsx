import actionCreatorFactory from "typescript-fsa";
import { LawtextAppPageState } from "../states";

export enum ActionTypes {
    // eslint-disable-next-line no-unused-vars
    MODIFY_STATE = "MODIFY_STATE",
}

const ac = actionCreatorFactory();

export const LawtextAppPageActions = {
    modifyState: ac<Partial<LawtextAppPageState>>(ActionTypes.MODIFY_STATE),
};
