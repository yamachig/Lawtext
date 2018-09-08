import { LawtextAppPageState } from '../states'
import actionCreatorFactory from 'typescript-fsa';

export enum ActionTypes {
    MODIFY_STATE = 'MODIFY_STATE',
};

const ac = actionCreatorFactory();

export const LawtextAppPageActions = {
    modifyState: ac<Partial<LawtextAppPageState>>(ActionTypes.MODIFY_STATE),
};
