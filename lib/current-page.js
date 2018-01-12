var currentPage;

exports.get = function () {
  return currentPage;
};

exports.set = function (c) {
  currentPage = c;
};
