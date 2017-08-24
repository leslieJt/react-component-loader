/**
 * Created by fed on 16/8/5.
 */
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

exports.component = function (components, config) {
  var emptyIdentifier = uniqueIdGenerator('emptyReactComponent');
  var resultStr = '';
  var importList = [
    'import { IndexRoute } from "react-router";\n',
    'import Loadable from "react-loadable";\n',
    'const ' + emptyIdentifier + ' = ({ children }) => children;\n',
  ];
  var currentPath = ['.'];
  traverseTree(components, function (value, key, hasChild) {
    currentPath.push(key);
    if (config.externals.indexOf(currentPath.slice(1).join('/')) > -1) return;
    if (!hasChild) {
      var identifier = uniqueIdGenerator('reactComponent');
      var router = identifier + '_route';
      var comp = currentPath.join('/') + '/view.jsx';
      importList.push('import { route as ' + router + ' } from "'
        + currentPath.join('/') + '/me.json";\n'
      );
      var component = 'Loadable({ loading: Loading, loader: () => import("' + comp + '") })';
      if (key === config.index) {
        resultStr += '<IndexRoute component={' + component + '} /> \n';
      }
      resultStr += '<Route path={"' + key + '" + (' + router +' || "")} ' +
        'component={ ' + component + ' }/>\n';
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
    if (!hasChild) {
      var identifier = uniqueIdGenerator('reduxComponent');
      importList.push('import ' + identifier +
        ' from "' + currentPath.join('/') + '/reducers.js";\n');
      resultStr += '"' + currentPath.slice(1).join('/') + '": ' + identifier +',\n';
    }
  }, function () {
    currentPath.pop();
  });
  return [resultStr + '}\n', importList.join('\n')];
};

exports.saga = function (components) {
  var importList = [];
  var resultList = [];
  var currentPath = ['.'];
  traverseTree(components, function (value, key, hasChild) {
    currentPath.push(key);
    if (!hasChild) {
      var identifier = uniqueIdGenerator('reduxComponent');
      importList.push('import ' + identifier +
        ' from "' + currentPath.join('/') + '/saga.js";\n');
      resultList.push(identifier);
    }
  }, function () {
    currentPath.pop();
  });
  return ['[' + resultList.join(',') + ']', importList.join('\n')];
};
