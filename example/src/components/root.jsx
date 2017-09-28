/**
 * Created by fed on 2017/8/24.
 */
import React from 'react';
import { ConnectedRouter } from 'react-router-redux';
import {  Route, Switch } from 'react-router-dom';

import Nav from './nav/view.jsx';
import Login from './login/view.jsx';

// alert!! for loader
import Loading from './common/loading.jsx';
import reducers from './index';
let store;



const NavWrapper = ({ match }) => {
  return (<Nav>
    <Switch>
    __ROOT_ROUTE__
    </Switch>
  </Nav>);
}

const Routes = ({ history, store: innerStore }) => {
  store = innerStore;
  return (
    <ConnectedRouter history={history}>
      <Switch>
        <Route path='/login' component={Login} />
        <Route path='/' component={NavWrapper} />
      </Switch>
    </ConnectedRouter>
  );
};

Routes.propTypes = {
  history: React.PropTypes.object,
};

export default Routes;
