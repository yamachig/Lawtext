import actionCreatorFactory from 'typescript-fsa';
import { LawtextAppPageState } from '../states';

export enum ActionTypes {
    MODIFY_STATE = 'MODIFY_STATE',
};

const ac = actionCreatorFactory();

export const LawtextAppPageActions = {
    modifyState: ac<Partial<LawtextAppPageState>>(ActionTypes.MODIFY_STATE),
};
