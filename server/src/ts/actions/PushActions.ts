import { push, replace, RouterAction } from 'react-router-redux';

/**
 * 任意のパスに移動する
 * @param path 任意のパス
 */
export function to(path: string): RouterAction {
  return push(path);
}

/**
 * ログイン画面
 */
export function toLogIn(): RouterAction {
  return push('/logIn');
}

/**
 * トップ画面
 */
export function toTop(): RouterAction {
  return push('/');
}

/**
 * タイムライン
 */
export function replaceTimeLine(year: number, month: number): RouterAction {
  const pathMonth: string = 9 < month ? month.toString() : `0${month}`;
  return replace(`/timeline/${year}${pathMonth}`);
}

/**
 * ログアウト
 */
export function toLogout(): RouterAction {
  return push('/logout');
}
