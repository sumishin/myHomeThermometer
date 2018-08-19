import * as importStyle from './logIn.scss';
import * as CSSModules from 'react-css-modules';

import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { CognitoUser, CognitoUserSession, AuthenticationDetails, CognitoUserPool } from 'amazon-cognito-identity-js';

import { AsyncTaskState, initialAsyncTaskState } from 'src/commonTypes';
import { StyleableComponent, StyleableComponentProps } from 'src/ts/components/StyleableComponent';
import { StoreStates } from 'src/ts/reducers/appReducers';
import { AppContextState } from 'src/ts/reducers/appContextReducer';
import * as AppContextActions from 'src/ts/actions/AppContext';
import * as PushActions from 'src/ts/actions/PushActions';

export interface MappedStateProps {
  app: AppContextState;
}

interface DispatchProps {
  willLogIn: (email: string, password: string, taskState: AsyncTaskState) => void;
}

interface LocalState {
  email: string;
  password: string;
  asyncTaskState?: AsyncTaskState;
}

export interface LogInProps extends MappedStateProps, DispatchProps, RouteComponentProps<{}, {}>, StyleableComponentProps {
}

export class LogInComponent extends StyleableComponent<LogInProps, LocalState> {

  constructor(props: LogInProps, context?: {}) {
    super(props, context);

    this.state = {
      email: '',
      password: '',
      asyncTaskState: undefined
    };

    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onSubmitForm = this.onSubmitForm.bind(this);
  }

  private onChangeEmail(e: React.SyntheticEvent): void {
    const input: HTMLInputElement = e.target as HTMLInputElement;
    this.setState({
      email: input.value
    });
  }

  private onChangePassword(e: React.SyntheticEvent): void {
    const input: HTMLInputElement = e.target as HTMLInputElement;
    this.setState({
      password: input.value
    });
  }

  private onSubmitForm(e: React.FormEvent): boolean {
    e.preventDefault();
    const email: string = this.state.email.trim();
    const password: string = this.state.password.trim();

    const taskState: AsyncTaskState = {...initialAsyncTaskState};
    this.setState({ asyncTaskState: taskState });

    this.props.willLogIn(email, password, taskState);

    return false;
  }

  public render(): JSX.Element {

    if (this.state.asyncTaskState !== undefined) {
      return (
        <div className={this.styles.logInRoot}>
          認証中
        </div>
      );
    }

    return (
      <div className={this.props.styles.logInRoot}>
        <form onSubmit={this.onSubmitForm}>
          <input type='text'
                className={this.styles.emailInput}
                value={this.state.email}
                placeholder='Email'
                onChange={this.onChangeEmail}/>
          <input type='password'
                className={this.styles.passwordInput}
                value={this.state.password}
                placeholder='Password'
                onChange={this.onChangePassword}/>
          <input type='submit'
                className={this.props.styles.submitInput}/>
        </form>
      </div>
    );
  }

  public componentWillUnmount(): void {

    if (this.state.asyncTaskState && !this.state.asyncTaskState.finished) {
      this.state.asyncTaskState.isCancelRequested = true;
      this.setState({ asyncTaskState: undefined });
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
    willLogIn: (email: string, password: string, taskState: AsyncTaskState) => {

      const auth: AuthenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password
      });

      const userPool: CognitoUserPool = new CognitoUserPool({
        UserPoolId: ENV.cognito.userPoolId,
        ClientId: ENV.cognito.clientId
      });
      const user: CognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });
      //tslint:disable:no-any
      const callback: any = {
        onSuccess: (session: CognitoUserSession, _userConfirmationNecessary?: boolean) => {
          if (taskState.isCancelRequested || taskState.finished) {
            return;
          }
          taskState.finished = true;

          dispatch(AppContextActions.setAccessToken(session.getIdToken().getJwtToken()));
          dispatch(PushActions.toTop());
        },
        onFailure: (err: any) => {
          if (taskState.isCancelRequested || taskState.finished) {
            return;
          }
          taskState.finished = true;

          if (err) {
            console.error(err);
          }
          window.location.assign('/fatalError.html');
        },
        //プロダクトでやったらあかんやつ
        newPasswordRequired: (_userAttributes: any, _requiredAttributes: any) => {
          const attr: any = {
            name: email
          };
          user.completeNewPasswordChallenge(password, attr, callback);
        }
      };

      user.authenticateUser(auth, callback);
    }
  };
}

//tslint:disable-next-line:no-any
const ComponentWithCSS: any = CSSModules(LogInComponent, importStyle);
export const LogIn: React.ComponentClass<{}> =
  connect(mapStateToProps, mapDispatchToProps)(ComponentWithCSS);
