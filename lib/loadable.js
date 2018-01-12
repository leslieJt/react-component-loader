/**
 * Created by fed on 2017/8/31.
 */
import React from 'react';
import createReactClass from 'create-react-class';

var STATE_LIST = {
  INIT: 0,
  RESOLVED: 1,
  ERROR: 2,
  PENDING: 3,
};

var setPage = require('./current-page').set;

export default function Loadable(args) {
  var Loading = args.loading;
  var loader = args.loader;
  var Result;
  var error;
  var state = STATE_LIST.INIT;
  return createReactClass({
    getInitialState: function() {
      return {
        state: state,
      };
    },
    componentWillMount: function() {
      var that = this;
      setPage(args.page);
      if (state === (STATE_LIST.INIT) || state === STATE_LIST.PENDING) {
        state = STATE_LIST.PENDING;
        loader = (typeof loader === 'function' ? loader() : loader).then(function(view) {
          Result = view.default || view;
          state = STATE_LIST.RESOLVED;
          that.setState({
            state: state,
          });
          return view;
        }).catch(function(err) {
          error = err;
          console.error(err);
          state = STATE_LIST.ERROR;
          that.setState({
            state: state,
          });
        });
      }
    },
    render: function() {
      switch (this.state.state) {
        case STATE_LIST.RESOLVED:
          return React.createElement(Result, this.props);
        default:
          return React.createElement(Loading, this.props, { err: error && error.toString() });
      }
    }
  });
}