import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { History } from 'history';
import { createStore, Store, Middleware, applyMiddleware } from 'redux';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux';

import { AppProvider } from 'src/ts/containers/AppProvider';
import { appReducers } from 'src/ts/reducers/appReducers';

const appRouterMiddleware: Middleware = routerMiddleware(browserHistory);
const store: Store = createStore(appReducers, applyMiddleware(appRouterMiddleware));
const history: History = syncHistoryWithStore(browserHistory, store);

//api.initialize(store);

try {

  ReactDOM.render(
    <AppProvider
      store={store}
      history={history}
    />,
    document.getElementById('root')
  );

} catch (e) {
  console.error(e);
  window.location.assign('/fatalError.html');
}
