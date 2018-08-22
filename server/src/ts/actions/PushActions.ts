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
export function replaceTimeLine(year: number, month: number, day: number): RouterAction {
  const pathMonth: string = 9 < month ? month.toString() : `0${month}`;
  const pathDay: string = 9 < day ? day.toString() : `0${day}`;
  return replace(`/timeline/${year}${pathMonth}${pathDay}`);
}

/**
 * ログアウト
 */
export function toLogout(): RouterAction {
  return push('/logout');
}
