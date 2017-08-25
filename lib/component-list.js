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
    var matched = glob('*/', {
      cwd: newCwd,
    });
    var isPage = false;
    try {
        fs.stat(path.join(newCwd, matched, 'view.jsx'));
        isPage = true;
    } catch (e) {};
    if (matched.length && !isPage) {
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
