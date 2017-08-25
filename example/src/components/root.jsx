/**
 * Created by fed on 2017/8/24.
 */
import React from 'react';
import { Route, Router } from 'react-router';

import reducers from './index';
let store;

const Loading = () => <div>mdzz, 我还在加载中</div>;
const Nav = ({children}) => <div>wokao{children}</div>;
const Login = () => <div>login...</div>;


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
