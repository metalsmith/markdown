const { basename, dirname, extname, join } = require('path')
const debug = require('debug')('@metalsmith/markdown')
const get = require('dlv')
const set = require('dset').dset
const { marked } = require('marked')
const expandWildcardKeypaths = require('./expand-wildcard-keypath')

/**
 * Check if a `file` is markdown
 * @param {String} filePath
 * @return {Boolean}
 */
function isMarkdown(filePath) {
  return /\.md$|\.markdown$/.test(extname(filePath))
}

function render(data, key, options) {
  const value = get(data, key)
  if (typeof value === 'string') {
    set(data, key, marked(value, options))
    debug('rendered "%s"', key.join ? key.join('.') : key)
  }
}

/**
 * @typedef Options
 * @property {string[]} [keys] - Key names of file metadata to render to HTML - can be nested
 * @property {boolean} [wildcard=false] - Expand `*` wildcards in keypaths
 **/

const defaultOptions = {
  keys: [],
  wildcard: false
}

/**
 * A Metalsmith plugin to render markdown files to HTML
 * @param {Options} [options]
 * @return {import('metalsmith').Plugin}
 */
function initMarkdown(options = defaultOptions) {
  if (options === true) {
    options = defaultOptions
  } else {
    options = Object.assign({}, defaultOptions, options)
  }

  return function markdown(files, metalsmith, done) {
    setImmediate(done)

    Object.keys(files).forEach(function (file) {
      debug('checking file: %s', file)
      if (!isMarkdown(file)) {
        return
      }

      const data = files[file]
      const dir = dirname(file)
      let html = basename(file, extname(file)) + '.html'
      if ('.' != dir) html = join(dir, html)

      debug('converting file: %s', file)
      const str = marked(data.contents.toString(), options)
      data.contents = Buffer.from(str)

      let keys = options.keys
      if (options.wildcard) {
        keys = expandWildcardKeypaths(data, options.keys, '*')
      }
      keys.forEach((k) => render(data, k, options))

      delete files[file]
      files[html] = data
    })
  }
}

module.exports = initMarkdown
