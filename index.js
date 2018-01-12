/**
 * Created by fed on 16/8/5.
 */
var componentList = require('./lib/component-list');
var generators = require('./lib/generator');
var assign = require('object-assign');
var path = require('path');
var loaderUtils = require('loader-utils');

var UPDATE_SAGA = '@@INNER/UPDATE_SAGA';
var namespaceName = require('./lib/babel-plugin-action-name-init').namespaceName;

module.exports = function (request) {
  var query = loaderUtils.getOptions(this) || {};
  var reducerName = query.reducerName || 'reducer';
  var componentDir = query.componentDir || 'components';
  var ctx = this;
  if (query.types) {
    var namespace = path.dirname(
      path.relative(path.join(query.root, componentDir), ctx.resourcePath)
    ).toUpperCase();
    this.cacheable();
    return ['const ' + namespaceName + ' = "/' + namespace + '/";', request].join('\n');
  }
  if (query.bundle) {
    var result = [];
    result.push('import v from "./view.jsx";');
    result.push('import r from "./' + reducerName + '";');
    result.push('import s from "./saga";');
    result.push('export const view = v;');
    result.push('export const reducer = r;');
    result.push('export const saga = s;');
    this.addDependency(this.context + '/view.jsx');
    this.addDependency(this.context + '/'+ reducerName + '.js');
    this.addDependency(this.context + '/saga.js');
    this.cacheable();
    return result.join('\n');
  }
  var config = assign({
    externals: [],
    dir: path.join(process.cwd(), 'src', componentDir),
    index: 'list',
    reducers: '__ROOT_REDUCER__',
    saga: '__ROOT_SAGA__',
    component: '__ROOT_ROUTE__',
    UPDATE_SAGA: UPDATE_SAGA,
    store: 'store',
    reducerInject: 'reducers',
    reducerName: reducerName,
    reducerDecorator: '',
  }, query);
  var items = ['reducers', 'saga', 'component'].filter(function (value) {
    return request.indexOf(config[value]) > -1;
  });
  var cacheable = true;
  if (items.length > 0) {
    cacheable = false;
    var components = componentList(config);
    items.forEach(function (value) {
      var result = generators[value](components, config, ctx);
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
