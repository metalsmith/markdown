
var basename = require('path').basename;
var debug = require('debug')('metalsmith-markdown');
var dirname = require('path').dirname;
var extname = require('path').extname;
var marked = require('marked');

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Metalsmith plugin to convert markdown files.
 *
 * @param {Object} options (optional)
 *   @property {Array} keys
 * @return {Function}
 */

function plugin(options){
  options = options || {};
  var keys = options.keys || [];

  var mix = function(obj1, obj2) {
    var newObj = {};
    var key;
    for (key in obj1) {
      if (obj1.hasOwnProperty(key)) {
        newObj[key] = obj1[key];
      }
    }
    for (key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        newObj[key] = obj2[key];
      }
    }
    return newObj;
  };

  return function(files, metalsmith, done){
    setImmediate(done);

    if (options.useMetadata) {
      options = mix(options, metalsmith.data);
    }

    Object.keys(files).forEach(function(file){
      debug('checking file: %s', file);
      if (!markdown(file)) return;
      var data = files[file];
      var dir = dirname(file);
      var html = basename(file, extname(file)) + '.html';
      if ('.' != dir) html = dir + '/' + html;

      debug('converting file: %s', file);
      markedOptions = (options.useMetadata ? mix(options, data) : options);
      var str = marked(data.contents.toString(), markedOptions);
      data.contents = new Buffer(str);
      keys.forEach(function(key) {
        data[key] = marked(data[key], markedOptions);
      });

      delete files[file];
      files[html] = data;
    });
  };
}

/**
 * Check if a `file` is markdown.
 *
 * @param {String} file
 * @return {Boolean}
 */

function markdown(file){
  return /\.md|\.markdown/.test(extname(file));
}