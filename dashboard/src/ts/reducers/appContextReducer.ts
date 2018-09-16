import { Reducer } from 'redux';

import { Action } from 'src/commonTypes';
import { AppContextActionType } from 'src/ts/actions/AppContext';
import { MyHomeThermometer } from 'src/ts/graphQL/types';

export interface AppContextState {
  authenticated: boolean;
  accessToken: string;
  isFetching: boolean;
  isMoreFetching: boolean;
  timeline: MyHomeThermometer[];
  lastTimestamp?: number;
}

export const initialState: AppContextState = {
  authenticated: false,
  accessToken: '',
  isFetching: false,
  isMoreFetching: false,
  timeline: [],
  lastTimestamp: undefined
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
    case AppContextActionType.SET_MORE_FETCHING:
      newstate.isMoreFetching = <boolean>action.payload;
      return newstate;
    case AppContextActionType.SET_DATA:
      newstate.timeline = <MyHomeThermometer[]>action.payload;
      if (0 < newstate.timeline.length) {
        newstate.lastTimestamp = newstate.timeline[newstate.timeline.length - 1].timestamp;
      } else {
        newstate.lastTimestamp = undefined;
      }
      return newstate;
    case AppContextActionType.ADD_DATA:
      const addPayload: MyHomeThermometer[] = <MyHomeThermometer[]>action.payload;
      if (0 < addPayload.length) {
        newstate.timeline = newstate.timeline.concat(addPayload);
        newstate.lastTimestamp = newstate.timeline[newstate.timeline.length - 1].timestamp;
      } else {
        newstate.lastTimestamp = undefined;
      }
      return newstate;
    default:
      return state;
  }
};
