import { Action } from 'src/commonTypes';

export enum AppContextActionType {
  SET_ACCESS_TOKEN = 'APP_CONTEXT_SET_ACCESS_TOKEN',
  SET_FETCHING = 'APP_CONTEXT_SET_FETCHING'
}

export function setAccessToken(token: string): Action<string> {
  return {
    type: AppContextActionType.SET_ACCESS_TOKEN,
    payload: token
  };
}

export function setFetching(isFetching: boolean): Action<boolean> {
  return {
    type: AppContextActionType.SET_FETCHING,
    payload: isFetching
  };
}
