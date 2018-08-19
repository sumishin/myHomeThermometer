import * as importStyle from './AppMain.scss';
import * as CSSModules from 'react-css-modules';

import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';

import { AsyncTaskState, initialAsyncTaskState } from 'src/commonTypes';
import { StyleableComponent, StyleableComponentProps } from 'src/ts/components/StyleableComponent';
import { StoreStates } from 'src/ts/reducers/appReducers';
import { AppContextState } from 'src/ts/reducers/appContextReducer';
import * as AppContextActions from 'src/ts/actions/AppContext';
import * as PushActions from 'src/ts/actions/PushActions';

export interface MappedStateProps {
  app: AppContextState;
}

// react-routerのパスで指定されたパラメタ
export interface PathParams {
  date?: string;
}

interface DispatchProps {
  willMount: () => void;
  didAuthorized: (taskState: AsyncTaskState) => void;
  toLogout: () => void;
  didCanceled: () => void;
}

interface LocalState {
  asyncTaskState?: AsyncTaskState;
}

export interface AppMainProps extends MappedStateProps, DispatchProps, RouteComponentProps<PathParams, {}>, StyleableComponentProps {
}

export class AppMainComponent extends StyleableComponent<AppMainProps, LocalState> {

  constructor(props: AppMainProps, context?: {}) {
    super(props, context);

    this.state = {
      asyncTaskState: undefined
    };
  }

  public render(): JSX.Element {

    const nowLoading: boolean = !this.props.app.authenticated;
    if (nowLoading) {
      return (
        <div className={this.styles.appMainRoot}>
          読み込み中
          <pre>
            {this.props.params.date}
            {JSON.stringify(ENV, undefined, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div className={this.props.styles.appMainRoot}>
        認証した
        <pre>
          {this.props.params.date}
          {JSON.stringify(ENV, undefined, 2)}
        </pre>
      </div>
    );
  }

  public componentWillMount(): void {
    this.props.willMount();
  }

  public componentWillReceiveProps(nextProps: AppMainProps, _nextContext: {}): void {

    if (!this.props.app.authenticated && nextProps.app.authenticated) {

      const taskState: AsyncTaskState = {...initialAsyncTaskState};
      this.setState({ asyncTaskState: taskState });
      this.props.didAuthorized(taskState);
      return;
    }
  }

  public componentWillUnmount(): void {

    if (this.state.asyncTaskState && !this.state.asyncTaskState.finished) {
      this.state.asyncTaskState.isCancelRequested = true;
      this.props.didCanceled();
      this.setState({ asyncTaskState: undefined });
    }
  }
}

export function mapStateToProps(state: StoreStates): MappedStateProps {
  return {
    app: state.appContext
  };
}

export const authenticate: (dispatch: Dispatch<Action>) => void = (_dispatch) => {
  console.error('TODO 実装');
};

export function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
  return {
    willMount: () => authenticate(dispatch),
    didAuthorized: async (_taskState: AsyncTaskState) => {
      console.error('TODO 実装');
    },
    toLogout: () => dispatch(PushActions.toLogout()),
    didCanceled: () => dispatch(AppContextActions.setFetching(false))
  };
}

//tslint:disable-next-line:no-any
const ComponentWithCSS: any = CSSModules(AppMainComponent, importStyle);
export const AppMain: React.ComponentClass<{}> =
  connect(mapStateToProps, mapDispatchToProps)(ComponentWithCSS);
