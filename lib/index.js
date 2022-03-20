const { basename, dirname, extname, join } = require('path')
const debug = require('debug')('@metalsmith/markdown')
const { marked } = require('marked')

/**
 * Check if a `file` is markdown
 * @param {String} filePath
 * @return {Boolean}
 */
function isMarkdown(filePath) {
  return /\.md$|\.markdown$/.test(extname(filePath))
}

/**
 * @typedef Options
 * @property {String[]} keys - Key names of file metadata to render to HTML
 **/

/**
 * A Metalsmith plugin to render markdown files to HTML
 * @param {Options} [options]
 * @return {import('metalsmith').Plugin}
 */
function initMarkdown(options) {
  options = options || {}
  const keys = options.keys || []

  return function markdown(files, metalsmith, done) {
    setImmediate(done)
    Object.keys(files).forEach(function (file) {
      debug('checking file: %s', file)
      if (!isMarkdown(file)) return
      const data = files[file]
      const dir = dirname(file)
      let html = basename(file, extname(file)) + '.html'
      if ('.' != dir) html = join(dir, html)

      debug('converting file: %s', file)
      const str = marked(data.contents.toString(), options)
      data.contents = Buffer.from(str)
      keys.forEach(function (key) {
        if (data[key]) {
          data[key] = marked(data[key].toString(), options)
        }
      })

      delete files[file]
      files[html] = data
    })
  }
}

module.exports = initMarkdown
