var basename = require('path').basename;
var debug = require('debug')('metalsmith-markdown');
var dirname = require('path').dirname;
var extname = require('path').extname;
var join = require('path').join;
var marked = require('marked');

/**
 * Check if a `file` is markdown.
 *
 * @param {String} file
 * @return {Boolean}
 */
var markdown = function(file) {
  return /\.md$|\.markdown$/.test(extname(file));
};

/**
 * Metalsmith plugin to convert markdown files.
 *
 * @param {Object} options (optional)
 *   @property {Array} keys
 * @return {Function}
 */
var plugin = function(options) {
  options = options || {};
  var keys = options.keys || [];

  return function(files, metalsmith, done) {
    setImmediate(done);
    Object.keys(files).forEach(function(file) {
      debug('checking file: %s', file);
      if (!markdown(file)) return;
      var data = files[file];
      var dir = dirname(file);
      var html = basename(file, extname(file)) + '.html';
      if ('.' != dir) html = join(dir, html);

      debug('converting file: %s', file);
      var str = marked(data.contents.toString(), options);
      try {
        // preferred
        data.contents = Buffer.from(str);
      } catch (err) {
        // node versions < (5.10 | 6)
        data.contents = new Buffer(str);
      }
      keys.forEach(function(key) {
        if (data[key]) {
          data[key] = marked(data[key].toString(), options);
        }
      });

      delete files[file];
      files[html] = data;
    });
  };
};

// Expose Plugin
module.exports = plugin;
