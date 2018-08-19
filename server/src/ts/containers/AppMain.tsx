import * as importStyle from './AppMain.scss';
import * as CSSModules from 'react-css-modules';

import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';

import { StyleableComponent, StyleableComponentProps } from 'src/ts/components/StyleableComponent';
import { StoreStates } from 'src/ts/reducers/appReducers';
import { AppContextState } from 'src/ts/reducers/appContextReducer';
import * as PushActions from 'src/ts/actions/PushActions';

export interface MappedStateProps {
  app: AppContextState;
}

// react-routerのパスで指定されたパラメタ
export interface PathParams {
  date?: string;
}

interface DispatchProps {
  toSignIn: () => void;
}

export interface AppMainProps extends MappedStateProps, DispatchProps, RouteComponentProps<PathParams, {}>, StyleableComponentProps {
}

export class AppMainComponent extends StyleableComponent<AppMainProps, {}> {

  constructor(props: AppMainProps, context?: {}) {
    super(props, context);
  }

  public render(): JSX.Element {

    const nowLoading: boolean = !this.props.app.authenticated;
    if (nowLoading) {
      return (
        <div className={this.styles.appMainRoot}>
          読み込み中
        </div>
      );
    }

    return (
      <div className={this.props.styles.appMainRoot}>
        認証した
        <pre>
          {this.props.params.date}
          {this.props.app.accessToken}
          {JSON.stringify(ENV, undefined, 2)}
        </pre>
      </div>
    );
  }

  public componentWillMount(): void {
    if (!this.props.app.authenticated) {
      this.props.toSignIn();
    }
  }
}

export function mapStateToProps(state: StoreStates): MappedStateProps {
  return {
    app: state.appContext
  };
}

export function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
  return {
    toSignIn: () => dispatch(PushActions.toLogIn())
  };
}

//tslint:disable-next-line:no-any
const ComponentWithCSS: any = CSSModules(AppMainComponent, importStyle);
export const AppMain: React.ComponentClass<{}> =
  connect(mapStateToProps, mapDispatchToProps)(ComponentWithCSS);
