import { Reducer, combineReducers } from 'redux';
import { routerReducer, RouterState } from 'react-router-redux';

import { appContextReducer, AppContextState } from 'src/ts/reducers/appContextReducer';

export interface StoreStates {
  appContext: AppContextState;
  routing: RouterState;
}

export const appReducers: Reducer<{}> = combineReducers({
  appContext: appContextReducer,
  routing: routerReducer
});
