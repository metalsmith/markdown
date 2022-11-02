const { basename, dirname, extname, join } = require('path')
const get = require('dlv')
const set = require('dset').dset
const { marked } = require('marked')
const expandWildcardKeypaths = require('./expand-wildcard-keypath')

function render(data, key, options) {
  const value = get(data, key)
  if (typeof value === 'string') {
    set(data, key, marked(value, options))
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

    const debug = metalsmith.debug('@metalsmith/markdown')
    const matches = metalsmith.match('**/*.{md,markdown}', Object.keys(files))

    debug('Running with options: %O', options)
    if (matches.length === 0) {
      debug.warn('No markdown files found.')
    } else {
      debug('Processing %s markdown file(s)', matches.length)
    }

    matches.forEach(function (file) {
      const data = files[file]
      const dir = dirname(file)
      let html = basename(file, extname(file)) + '.html'
      if ('.' != dir) html = join(dir, html)

      debug.info('Rendering file "%s" as "%s"', file, html)
      const str = marked(data.contents.toString(), options)
      data.contents = Buffer.from(str)

      let keys = options.keys
      if (options.wildcard) {
        keys = expandWildcardKeypaths(data, options.keys, '*')
      }
      keys.forEach((k) => {
        debug.info('Rendering key "%s" of file "%s"', k.join ? k.join('.') : k, file)
        render(data, k, options)
      })

      delete files[file]
      files[html] = data
    })
  }
}

module.exports = initMarkdown
