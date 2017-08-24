/**
 * Created by fed on 16/8/5.
 */
var componentList = require('./lib/component-list');
var generators = require('./lib/generator');
var assign = require('object-assign');
var path = require('path');
var loaderUtils = require('loader-utils');

var UPDATE_SAGA = '@@INNER/UPDATE_SAGA';

module.exports = function (request) {
  var query = loaderUtils.getOptions(this) || {};
  var config = assign({
    externals: [],
    dir: path.join(process.cwd(), 'src', 'components'),
    index: 'list',
    reducers: '__ROOT_REDUCER__',
    saga: '__ROOT_SAGA__',
    component: '__ROOT_ROUTE__',
    UPDATE_SAGA: UPDATE_SAGA,
  }, query);
  var items = ['reducers', 'saga', 'component'].filter(function (value) {
    return request.indexOf(config[value]) > -1;
  });
  var cacheable = true;
  if (items.length > 0) {
    cacheable = false;
    var components = componentList(config);
    items.forEach(function (value) {
      var result = generators[value](components, config);
      request = result[1] + request;
      request = request.replace(config[value], result[0]);
    });
  }
  if (cacheable) {
    this.cacheable();
  }
  return request;
};

exports.UPDATE_SAGA = UPDATE_SAGA;
