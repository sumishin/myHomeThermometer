import * as React from 'react';

import { History } from 'history';
import { Store } from 'redux';
import { Router, Route, IndexRoute } from 'react-router';
import { Provider } from 'react-redux';

import { AppMain } from 'src/ts/containers/AppMain';
import { TimeLine } from 'src/ts/containers/TimeLine';
import { LogIn } from 'src/ts/containers/LogIn';
import { Logout } from 'src/ts/containers/Logout';
import { NotFound } from 'src/ts/containers/NotFound';

export interface AppProviderProps {
  store: Store;
  history: History;
}

class AppProviderComponent extends React.Component<AppProviderProps, {}> {

  constructor(props: AppProviderProps, context?: {}) {
    super(props, context);
  }

  public render(): JSX.Element {
    return (
      <Provider store={this.props.store}>
        <Router history={this.props.history}>
          <Route path='/logIn' component={LogIn} />
          <Route path='/logout' component={Logout} />
          <Route path='/' component={AppMain} >
            <IndexRoute component={TimeLine} />
            <Route path='/timeline/:yyyymmdd' component={TimeLine} />
          </Route>
          <Route path='/*' component={NotFound} />
        </Router>
      </Provider>
    );
  }
}

export const AppProvider: React.ComponentClass<AppProviderProps> = AppProviderComponent;
