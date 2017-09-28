import React from 'react';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { createHashHistory } from 'history';
import { routerMiddleware } from 'react-router-redux';

import reducers, { rootSaga } from './components/index';
import RootView from './components/root.jsx';

const sagaMiddleware = createSagaMiddleware();
const hashHistory = createHashHistory();

const store = createStore(
  combineReducers(reducers),
  compose(
    applyMiddleware(sagaMiddleware),
    applyMiddleware(routerMiddleware(hashHistory)),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  ));

sagaMiddleware.run(rootSaga);

render(
  <Provider store={store}>
    <RootView history={hashHistory} store={store} />
  </Provider>,
  document.getElementById('container')
);