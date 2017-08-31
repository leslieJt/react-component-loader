/**
 * Created by fed on 16/8/5.
 */
var path = require('path');
var fs = require('fs');
var glob = require('glob').sync;
var loaderUtils = require('loader-utils');

function traverseTree(tree, enter, leave) {
  Object.keys(tree).forEach(function (key) {
    var hasChild = typeof tree[key] === 'object';
    enter(tree[key], key, hasChild);
    if (hasChild) {
      traverseTree(tree[key], enter, leave);
    }
    leave(tree[key], key, hasChild);
  });
}

var counter = 0;
function uniqueIdGenerator(prefix) {
  return prefix + '_' + counter++;
}

function getMeta(currentPath, config) {
  var jsonPath = path.join.apply(path, [config.dir].concat(currentPath, 'me'));
  try {
    return require(jsonPath);
  } catch (e) {
    return {};
  }
}

function shouldRoute(config, currentPath, name) {
  var fullPath = path.join.apply(path, [config.dir].concat(currentPath, name));
  try {
    fs.statSync(fullPath);
    return true;
  } catch (e) {
    return false;
  }
}

exports.component = function (components, config) {
  var emptyIdentifier = uniqueIdGenerator('emptyReactComponent');
  var resultStr = '';
  var importList = [
    'import { IndexRoute } from "react-router";\n',
    'import Loadable from ' + loaderUtils.stringifyRequest(this, path.join(__dirname, 'loadable.js')) + ';\n',
    'import { combineReducers } from "redux";\n',
    'const ' + emptyIdentifier + ' = ({ children }) => children;\n',
  ];
  var currentPath = ['.'];
  traverseTree(components, function (value, key, hasChild) {
    currentPath.push(key);
    if (config.externals.indexOf(currentPath.slice(1).join('/')) > -1) return;
    if (!hasChild) {
      var metaInfo = getMeta(currentPath, config);
      var shouldBuild = shouldRoute(config, currentPath, 'view.jsx');
      if (!shouldBuild) {
        glob('*.jsx', {
          cwd: path.join.apply(path, [config.dir].concat(currentPath))
        }).forEach(function (item) {
          importList.push('import "' + currentPath.join('/') + '/' + item + '";');
        });
      } else {
        var component;
        if (metaInfo.sync) {
          var comp = currentPath.join('/') + '/view.jsx';
          component = 'Loadable({ loading: Loading, loader: () => import("' + comp + '") })';
        } else {
          var comp = currentPath.join('/') + '/me.json';
          var reducerKey = currentPath.slice(1).join('/');
          component = 'Loadable({ loading: Loading, loader: () =>' +
            ' import("' + comp + '")' +
            '.then(({view, reducer, saga}) => {\n' + config.store +
            '.dispatch({ type:' +
            '"' + config.UPDATE_SAGA + '",' +
            'saga:' +
            'saga' +
            '});\n' +
            'if (!' + config.reducerInject + '[' + JSON.stringify(reducerKey) + ']) { \n' +
            config.reducerInject + '[' + JSON.stringify(reducerKey) + '] = reducer;' +
            config.store +
            '.replaceReducer(combineReducers(reducers));} return view;' +
            '})' +
            ' })';
        }
        if (key === config.index) {
          resultStr += '<IndexRoute component={' + component + '} /> \n';
        }
        resultStr += '<Route path="' + key + (metaInfo.route || '') + '" ' +
          'component={ ' + component + ' }/>\n';
      }
    } else {
      resultStr += '<Route path="' + key + '" component={' + emptyIdentifier + '} >\n';
    }
  },  function (value, key, hasChild) {
    currentPath.pop();
    if (hasChild) {
      resultStr += '</Route>\n';
    }
  });
  return [resultStr + '\n', importList.join('\n')];
};

exports.reducers = function (components, config) {
  var resultStr = '{ \n';
  var importList = [
    'import { combineReducers } from "redux";\n',
  ];
  var currentPath = ['.'];
  traverseTree(components, function (value, key, hasChild) {
    currentPath.push(key);
    var metaInfo = getMeta(currentPath, config);
    var shouldBuild = shouldRoute(config, currentPath, 'view.jsx');
    var forceSync = config.externals.indexOf(currentPath.slice(1).join('/')) > -1;
    if (!hasChild && (shouldBuild || forceSync)) {
      var identifier = '""';
      if (forceSync || metaInfo.sync) {
        identifier = uniqueIdGenerator('reduxComponent');
        importList.push('import ' + identifier +
          ' from "' + currentPath.join('/') + '/reducer.js";\n');
      }
      resultStr += '"' + currentPath.slice(1).join('/') + '": ' + identifier +',\n';
    }
  }, function () {
    currentPath.pop();
  });
  return [resultStr + '}\n', importList.join('\n')];
};

exports.saga = function (components, config) {
  var importList = [];
  var resultList = [];
  var currentPath = ['.'];
  traverseTree(components, function (value, key, hasChild) {
    currentPath.push(key);
    var metaInfo = getMeta(currentPath, config);
    var shouldBuild = shouldRoute(config, currentPath, 'view.jsx');
    var forceSync = config.externals.indexOf(currentPath.slice(1).join('/')) > -1;
    if (!hasChild && (shouldBuild || forceSync)) {
      if (forceSync || metaInfo.sync) {
        var identifier = uniqueIdGenerator('reduxComponent');
        importList.push('import ' + identifier +
          ' from "' + currentPath.join('/') + '/saga.js";\n');
        resultList.push(identifier);
      } else {
        resultList.push('""');
      }
    }
  }, function () {
    currentPath.pop();
  });
  return ['[' + resultList.join(',') + ']', importList.join('\n')];
};
