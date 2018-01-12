var theAction = require('./actions');

module.exports = function decorateFn(fn, page) {
  return function (state, action) {
    if (action.type === theAction) {
      if (action.page === page) {
        return Object.assign({}, state, {
          [action.key]: action.value,
        });
      }
      return state;
    }
    return fn(state, action);
  }
};