/**
 * Created by fed on 2017/8/24.
 */
import React from 'react';
import { Route, Router } from 'react-router';

import Nav from './nav/view.jsx';
import Login from './login/view.jsx';

// alert!! for loader
import Loading from './common/loading.jsx';
import reducers from './index';
let store;


const Routes = ({ history, store }) => {
  store = store;
  return (
    <Router history={ history }>
      <Route path='/login' component={Login} />
      <Route path='/' component={Nav}>
        __ROOT_ROUTE__
      </Route>
    </Router>
  );
};

Routes.propTypes = {
  history: React.PropTypes.object,
};

export default Routes;
