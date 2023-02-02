import { basename, dirname, extname, join } from 'path'
import get from 'dlv'
import { dset as set } from 'dset'
import { marked } from 'marked'
import expandWildcardKeypaths from './expand-wildcard-keypath.js'

function defaultRender(source, options) {
  return marked(source, options)
}

function refsObjectToMarkdown(refsObject) {
  return Object.entries(refsObject)
    .map(([refname, value]) => `[${refname}]: ${value}`)
    .join('\n')
}

/**
 * @callback Render
 * @param {string} source
 * @param {Object} engineOptions
 * @param {{ path: string, key: string}} context
 */

/**
 * @typedef Options
 * @property {string[]} [keys] - Key names of file metadata to render to HTML - can be nested
 * @property {boolean} [wildcard=false] - Expand `*` wildcards in keypaths
 * @property {string|Object<string, string>} [globalRefs] An object of `{ refname: 'link' }` pairs that will be made available for all markdown files and keys,
 * or a `metalsmith.metadata()` keypath containing such object
 * @property {Render} [render] - Specify a custom render function with the signature `(source, engineOptions, context) => string`.
 * `context` is an object with a `path` key containing the current file path, and `key` containing the target key.
 * @property {Object} [engineOptions] Options to pass to the markdown engine (default [marked](https://github.com/markedjs/marked))
 **/

const defaultOptions = {
  keys: [],
  wildcard: false,
  render: defaultRender,
  engineOptions: {},
  globalRefs: {}
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

    let globalRefsMarkdown = ''
    if (typeof options.globalRefs === 'string') {
      const found = get(metalsmith.metadata(), options.globalRefs)
      if (found) {
        globalRefsMarkdown = refsObjectToMarkdown(found)
      } else {
        const err = new Error(`globalRefs not found in metalsmith.metadata().${options.globalRefs}`)
        err.name = 'Error @metalsmith/markdown'
        done(err)
      }
    } else if (typeof options.globalRefs === 'object' && options.globalRefs !== null) {
      globalRefsMarkdown = refsObjectToMarkdown(options.globalRefs)
    }

    if (globalRefsMarkdown.length) globalRefsMarkdown += '\n\n'

    matches.forEach(function (file) {
      const data = files[file]
      const dir = dirname(file)
      let html = basename(file, extname(file)) + '.html'
      if ('.' != dir) html = join(dir, html)

      debug.info('Rendering file "%s" as "%s"', file, html)
      const str = options.render(globalRefsMarkdown + data.contents.toString(), options.engineOptions, {
        path: file,
        key: 'contents'
      })
      data.contents = Buffer.from(str)

      let keys = options.keys
      if (options.wildcard) {
        keys = expandWildcardKeypaths(data, options.keys, '*')
      }
      keys.forEach((key) => {
        const value = get(data, key)
        if (typeof value === 'string') {
          debug.info('Rendering key "%s" of file "%s"', key.join ? key.join('.') : key, file)
          set(data, key, options.render(globalRefsMarkdown + value, options.engineOptions, { path: file, key }))
        } else {
          debug.warn('Couldn\'t render key %s of file "%s": not a string', key.join ? key.join('.') : key, file)
        }
      })

      delete files[file]
      files[html] = data
    })

    done()
  }
}

export default markdown
