/**
 * Created by fed on 16/8/5.
 */
const assign = require('object-assign');
const path = require('path');
const loaderUtils = require('loader-utils');
const generators = require('./lib/generator');
const componentList = require('./lib/component-list');

const UPDATE_SAGA = '@@INNER/UPDATE_SAGA';
const { namespaceName } = require('./lib/babel-plugin-action-name-init');
// @TODO how to improve the performance, may be by getter?
module.exports = function rrcLoader(request) {
  let resultRequest = request;
  const query = loaderUtils.getOptions(this) || {};
  const reducerName = query.reducerName || 'reducer';
  const componentDir = query.componentDir || 'components';
  const ctx = this;
  if (query.types) {
    const namespace = path.dirname(path.relative(path.join(query.root, componentDir), ctx.resourcePath)).toUpperCase();
    this.cacheable();
    return [`const ${namespaceName} = "/${namespace}/";`, request].join('\n');
  }
  if (query.bundle) {
    const result = [];
    result.push('import v from "./view.jsx";');
    result.push(`import r from "./${reducerName}";`);
    result.push('import s from "./saga";');
    result.push('export const view = v;');
    result.push('export const reducer = r;');
    result.push('export const saga = s;');
    this.cacheable();
    return result.join('\n');
  }
  const config = assign({
    externals: [],
    dir: path.join(process.cwd(), 'src', componentDir),
    index: 'list',
    reducers: '__ROOT_REDUCER__',
    saga: '__ROOT_SAGA__',
    component: '__ROOT_ROUTE__',
    UPDATE_SAGA,
    store: 'store',
    reducerInject: 'reducers',
    reducerName,
    reducerDecorator: '',
  }, query);
  const items = ['reducers', 'saga', 'component'].filter(value => request.indexOf(config[value]) > -1);
  if (items.length > 0) {
    const components = componentList(config);
    this.addContextDependency(config.dir);
    items.forEach((value) => {
      const [componentVarList, componentImportList] = generators[value](components, config, ctx);
      resultRequest = componentImportList + resultRequest;
      resultRequest = resultRequest.replace(config[value], componentVarList);
    });
    console.log(resultRequest)
  }
  this.cacheable();
  return resultRequest;
};

exports.UPDATE_SAGA = UPDATE_SAGA;
