import { Action } from 'src/commonTypes';
import { MyHomeThermometer } from 'src/ts/graphQL/types';

export enum AppContextActionType {
  SET_ACCESS_TOKEN = 'APP_CONTEXT_SET_ACCESS_TOKEN',
  SET_FETCHING = 'APP_CONTEXT_SET_FETCHING',
  SET_MORE_FETCHING = 'APP_CONTEXT_SET_MORE_FETCHING',
  SET_DATA = 'APP_CONTEXT_SET_DATA',
  ADD_DATA = 'APP_CONTEXT_ADD_DATA'
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

export function setMoreFetching(isFetching: boolean): Action<boolean> {
  return {
    type: AppContextActionType.SET_MORE_FETCHING,
    payload: isFetching
  };
}

export function setData(data: MyHomeThermometer[]): Action<MyHomeThermometer[]> {
  return {
    type: AppContextActionType.SET_DATA,
    payload: data
  };
}

export function addData(data: MyHomeThermometer[]): Action<MyHomeThermometer[]> {
  return {
    type: AppContextActionType.ADD_DATA,
    payload: data
  };
}
