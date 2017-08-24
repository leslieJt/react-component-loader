import React from 'react';
import assign from 'object-assign';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { hashHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer, routerMiddleware } from 'react-router-redux';

import reducers, { rootSaga } from './components/index';
import RootView from './components/root.jsx';

const sagaMiddleware = createSagaMiddleware();

const reducersWithRouter = combineReducers(assign({
  routing: routerReducer,
}, reducers));
const store = createStore(
  reducersWithRouter,
  compose(
    applyMiddleware(sagaMiddleware),
    applyMiddleware(routerMiddleware(hashHistory)),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  ));

sagaMiddleware.run(rootSaga);

const history = syncHistoryWithStore(hashHistory, store);

render(
  <Provider store={store}>
    <RootView history={history} />
  </Provider>,
  document.getElementById('container')
);