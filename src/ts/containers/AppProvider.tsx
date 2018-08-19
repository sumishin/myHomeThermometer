import * as React from 'react';

import { History } from 'history';
import { Store } from 'redux';
import { Router, Route } from 'react-router';
import { Provider } from 'react-redux';

import { AppMain } from 'src/ts/containers/AppMain';
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
          <Route path='/logout' component={Logout} />
          <Route path='/' component={AppMain} />
          <Route path='/days/:date' component={AppMain} />
          <Route path='/*' component={NotFound} />
        </Router>
      </Provider>
    );
  }
}

export const AppProvider: React.ComponentClass<AppProviderProps> = AppProviderComponent;
