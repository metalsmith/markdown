import { basename, dirname, extname, join } from 'path'
import get from 'dlv'
import { dset as set } from 'dset'
import { marked } from 'marked'
import expandWildcardKeypaths from './expand-wildcard-keypath.js'

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
 * @property {Object} [engineOptions] Options to pass to the markdown engine (default [marked](https://github.com/markedjs/marked))
 **/

const defaultOptions = {
  keys: [],
  wildcard: false,
  engineOptions: {}
}

/**
 * A Metalsmith plugin to render markdown files to HTML
 * @param {Options} [options]
 * @return {import('metalsmith').Plugin}
 */
function markdown(options = defaultOptions) {
  if (options === true) {
    options = defaultOptions
  } else {
    options = Object.assign({}, defaultOptions, options)
  }

  return function markdown(files, metalsmith, done) {
    setImmediate(done)

    const debug = metalsmith.debug('@metalsmith/markdown')
    const matches = metalsmith.match('**/*.{md,markdown}', Object.keys(files))

    const legacyEngineOptions = Object.keys(options).filter((opt) => !Object.keys(defaultOptions).includes(opt))
    if (legacyEngineOptions.length) {
      debug.warn('Starting from version 2.0 marked engine options will need to be specified as options.engineOptions')
      legacyEngineOptions.forEach((opt) => {
        options.engineOptions[opt] = options[opt]
      })
      debug.warn('Moved engine options %s to options.engineOptions', legacyEngineOptions.join(', '))
    }

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
      const str = marked(data.contents.toString(), options.engineOptions)
      data.contents = Buffer.from(str)

      let keys = options.keys
      if (options.wildcard) {
        keys = expandWildcardKeypaths(data, options.keys, '*')
      }
      keys.forEach((k) => {
        debug.info('Rendering key "%s" of file "%s"', k.join ? k.join('.') : k, file)
        render(data, k, options.engineOptions)
      })

      delete files[file]
      files[html] = data
    })
  }
}

export default markdown
