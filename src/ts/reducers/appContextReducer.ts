import { Reducer } from 'redux';

import { Action } from 'src/commonTypes';
import { AppContextActionType } from 'src/ts/actions/AppContext';

export interface AppContextState {
  authenticated: boolean;
  accessToken: string;
  isFetching: boolean;
}

export const initialState: AppContextState = {
  authenticated: false,
  accessToken: '',
  isFetching: false
};

export const appContextReducer: Reducer<AppContextState> = (state: AppContextState = initialState, action: Action<{}>): AppContextState => {
  const newstate: AppContextState = {...state};
  switch (action.type) {
    case AppContextActionType.SET_ACCESS_TOKEN:
      newstate.authenticated = true;
      newstate.accessToken = <string>action.payload;
      return newstate;
    case AppContextActionType.SET_FETCHING:
      newstate.isFetching = <boolean>action.payload;
      return newstate;
    default:
      return state;
  }
};
