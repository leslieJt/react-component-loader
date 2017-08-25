/**
 * Created by fed on 16/8/5.
 */
'use strict';
var glob = require('glob').sync;
var path = require('path');
var fs = require('fs');

var reducedOne = function(cwd) {
  return function (reduced, dir) {
    var newCwd = path.join(cwd, dir);
    if (glob('view.jsx', { cwd: newCwd,}).length) {
      reduced[dir] = true;
      return reduced;
    }
    var matched = glob('*/', {
      cwd: newCwd,
    });
    if (matched.length) {
      reduced[dir] =  matched.map(function (dir) {
        return dir.slice(0, -1);
      }).reduce(reducedOne(newCwd), {});
    } else {
      reduced[dir] = true;
    }
    return reduced;
  }
};

module.exports = function (config) {
 return glob('*/', {
    cwd: config.dir,
  }).map(function (dir) {
   return dir.slice(0, -1);
 }).reduce(reducedOne(config.dir), {});
};
