var store;

module.exports = function injectStore(s) {
  store = s;
};

module.exports.getStore = function() {
  return store;
};
