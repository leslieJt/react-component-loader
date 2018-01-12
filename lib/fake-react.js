import React from 'react';
var getStore = require('./inj-dispatch').getStore;
var getCurrentPage = require('./current-page').get;
var action = require('./actions');

var raw = React.createElement;

React.createElement = function createElement(type, config, children) {
  if (config) {
    var val = config['data-bind'];
    if (val) {
      var store = getStore();
      var page = getCurrentPage();
      var currentState = store.getState()[page];
      if (currentState) {
        config.value = currentState[val];
        config.onChange = function onChange(e) {
          if (!e || !e.target) {
            store.dispatch({
              type: action,
              page: page,
              key: val,
              value: e,
            });
          } else {
            store.dispatch({
              type: action,
              page: page,
              key: val,
              value: e.target.value,
            });
          }
        };
      }
    }
  }
  return raw.apply(React, arguments);
};
