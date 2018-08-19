/*
 * プロジェクトで利用する汎用的な型を定義定義。
 *
 * 文字列や画像ファイルなどはR.tsに
 * モジュールやクラスに依存する型はできるだけそちらに記述すること
 *
 */
import { Action as ReduxAction } from 'redux';

export interface Action<T> extends ReduxAction<string> {
  payload: T;
}

export interface AsyncTaskState {
  isCancelRequested: boolean;
  finished: boolean;
}

export const initialAsyncTaskState: AsyncTaskState = {
  isCancelRequested: false,
  finished: false
};
