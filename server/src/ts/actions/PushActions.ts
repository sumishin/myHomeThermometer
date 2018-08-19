import { push, RouterAction } from 'react-router-redux';

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
 * ログアウト
 */
export function toLogout(): RouterAction {
  return push('/logout');
}
