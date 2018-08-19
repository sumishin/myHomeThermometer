import * as importStyle from './Logout.scss';
import * as CSSModules from 'react-css-modules';

import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';

import { StoreStates } from 'src/ts/reducers/appReducers';
import { AppContextState } from 'src/ts/reducers/appContextReducer';
import { StyleableComponent, StyleableComponentProps } from 'src/ts/components/StyleableComponent';

export interface MappedStateProps {
  app: AppContextState;
}

export interface LogoutComponentProps extends MappedStateProps, RouteComponentProps<{}, {}>, StyleableComponentProps {
}

export class LogoutComponent extends StyleableComponent<LogoutComponentProps, {}> {
  constructor(props: LogoutComponentProps, context?: {}) {
    super(props, context);

    this.onClickReload = this.onClickReload.bind(this);
  }

  private onClickReload(e: React.MouseEvent<{}>): void {
    e.preventDefault();

    // 全体再読み込みさせたいのでlocation変更で移動
    window.location.assign('/');
  }

  public render(): JSX.Element {
    return (
      <div className={this.styles.logoutRoot}>
        <section className={this.styles.logoutReport}>
          <div className={this.styles.logoutMessage}>
            ログアウトしました。
          </div>
          <button
            className={this.styles.reloadButton}
            onClick={this.onClickReload}>
            別のアカウントでログイン
          </button>
        </section>
      </div>
    );
  }

  public componentWillMount(): void {
    if (this.props.app.authenticated) {
      window.alert('TODOログアウト');
      return;
    }
  }
}

export function mapStateToProps(state: StoreStates): MappedStateProps {
  return {
    app: state.appContext
  };
}

//tslint:disable-next-line:no-any
const ComponentWithCSS: any = CSSModules(LogoutComponent, importStyle);
export const Logout: React.ComponentClass<{}> =
  connect(mapStateToProps, {})(ComponentWithCSS);
