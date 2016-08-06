/**
 * Created by fed on 16/8/5.
 */
var componentList = require('./lib/component-list');
var generators = require('./lib/generator');
var querystring = require('querystring');
var assign = require('object-assign');
var path = require('path');

module.exports = function (source) {
  var config = assign({
    root: 'nav',
    dir: path.join(process.cwd(), 'src', 'components'),
    index: 'list',
    reducers: '__ROOT_REDUCER__',
    saga: '__ROOT_SAGA__',
    component: '__ROOT_ROUTE__',
  }, querystring.parse(this.query) || {});
  var components = componentList(config);
  var cacheable = true;
  ['reducers', 'saga', 'component'].forEach(function (value) {
    if (source.indexOf(config[value]) > -1) {
      var result = generators[value](components, config);
      source = result[1] + source;
      source = source.replace(config[value], result[0]);
      cacheable = false;
    }
  });
  if (cacheable) {
    this.cacheable();
  }
  return source;
};