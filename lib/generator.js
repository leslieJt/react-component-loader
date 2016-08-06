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
  var identifier = uniqueIdGenerator('reactComponent');
  var resultStr = '<Route path="/" component={' + identifier + '}>\n';
  var importList = [
    'import { Route, IndexRoute } from "react-router";\n',
    'const ' + emptyIdentifier + ' = ({ children }) => ( <div>{children} </div>);',
    'import ' + identifier +' from "./' + config.root + '/view.jsx";\n'
  ];
  var currentPath = ['.'];
  traverseTree(components, function (value, key, hasChild) {
    currentPath.push(key);
    if (!hasChild) {
      var identifier = uniqueIdGenerator('reactComponent');
      var router = identifier + '_route';
      importList.push('import ' + identifier +
        ', { route as ' + router
        +' } from "' + currentPath.join('/') + '/view.jsx";\n');
      if (key === config.index) {
        resultStr += '<IndexRoute component={' + identifier + '} />\n';
      }
      resultStr += '<Route path={"' + key + '" + (' + router +' || "")} component={' + identifier + '} />\n';
    }
    else {
      resultStr += '<Route path="' + key + '" component={' + emptyIdentifier + '} >\n';
    }
  }, function (value, key, hasChild) {
    currentPath.pop();
    if (hasChild) {
      resultStr += '</Route>\n';
    }
  });
  return [resultStr + '</Route>\n', importList.join('\n')];
};

exports.reducers = function (components, config) {
  var identifier = uniqueIdGenerator('reduxComponent');
  var resultStr = '{' + config.root +':' + identifier + ',\n';
  var importList = ['import ' + identifier +' from "./' + config.root + '/reducers.js";\n',
    'import { combineReducers } from "redux";\n',
  ];
  var currentPath = ['.'];
  traverseTree(components, function (value, key, hasChild) {
    currentPath.push(key);
    if (hasChild) {
      resultStr += key + ': combineReducers({\n';
    }
    else {
      var identifier = uniqueIdGenerator('reduxComponent');
      importList.push('import ' + identifier +
        ' from "' + currentPath.join('/') + '/reducers.js";\n');
      resultStr += key + ': ' + identifier +',\n';
    }
  }, function (value, key, hasChild) {
    currentPath.pop();
    if (hasChild) {
      resultStr += '}),\n';
    }
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
