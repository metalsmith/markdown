/* eslint-env node, mocha */

const assert = require('assert')
const equal = require('assert-dir-equal')
const Metalsmith = require('metalsmith')
const { name } = require('../package.json')
const markdown = require('..')
let expandWildcardKeypath
const path = require('path')

function msCommon(dir) {
  return Metalsmith(dir).env('DEBUG', process.env.DEBUG)
}

describe('@metalsmith/markdown', function () {
  before(function (done) {
    import('../src/expand-wildcard-keypath.js').then(imported => {
      expandWildcardKeypath = imported
      done()
    }) 
  })
  it('should export a named plugin function matching package.json name', function () {
    const namechars = name.split('/')[1]
    const camelCased = namechars.split('').reduce((str, char, i) => {
      str += namechars[i - 1] === '-' ? char.toUpperCase() : char === '-' ? '' : char
      return str
    }, '')
    assert.strictEqual(markdown().name, camelCased)
  })

  it('should not crash the metalsmith build when using default options', function (done) {
    msCommon('test/fixtures/default')
      .use(markdown())
      .build((err) => {
        assert.strictEqual(err, null)
        equal('test/fixtures/default/build', 'test/fixtures/default/expected')
        done()
      })
  })

  it('should treat "true" option as default', function (done) {
    const filePath = path.join('subfolder', 'index.html')
    function getFiles() {
      return {
        [path.join('subfolder', 'index.md')]: {
          contents: Buffer.from('"hello"')
        }
      }
    }

    Promise.all([
      new Promise((resolve) => {
        const files = getFiles()
        markdown(true)(files, msCommon(__dirname), () => {
          resolve(files)
        })
      }),
      new Promise((resolve) => {
        const files = getFiles()
        markdown()(files, msCommon(__dirname), () => {
          resolve(files)
        })
      }),
      new Promise((resolve) => {
        const files = getFiles()
        markdown({ smartypants: true })(files, msCommon(__dirname), () => {
          resolve(files)
        })
      })
    ])
      .then(([defaultsTrue, defaults, smartypants]) => {
        assert.strictEqual(defaults[filePath].contents.toString(), defaultsTrue[filePath].contents.toString())
        assert.notDeepStrictEqual(defaultsTrue[filePath].contents.toString(), smartypants[filePath].contents.toString())
        done()
      })
      .catch((err) => {
        done(err)
      })
  })

  it('should convert markdown files', function (done) {
    msCommon('test/fixtures/basic')
      .use(
        markdown({
          smartypants: true
        })
      )
      .build(function (err) {
        if (err) return done(err)
        equal('test/fixtures/basic/expected', 'test/fixtures/basic/build')
        done()
      })
  })

  it('should skip non-markdown files', function (done) {
    const files = { 'index.css': {} }
    markdown(true)(files, msCommon(__dirname), () => {
      assert.deepStrictEqual(files, { 'index.css': {} })
      done()
    })
  })

  it('should allow a "keys" option', function (done) {
    msCommon('test/fixtures/keys')
      .use(
        markdown({
          keys: ['custom'],
          smartypants: true
        })
      )
      .build(function (err, files) {
        if (err) return done(err)
        assert.equal('<p><em>a</em></p>\n', files['index.html'].custom)
        done()
      })
  })

  it('should parse nested key paths', function (done) {
    msCommon('test/fixtures/nested-keys')
      .use(
        markdown({
          keys: ['custom', 'nested.key.path'],
          smartypants: true
        })
      )
      .build(function (err, files) {
        if (err) return done(err)
        assert.equal('<h1 id="hello">Hello</h1>\n', files['index.html'].nested.key.path)
        done()
      })
  })

  it('expandWildCardKeyPath should throw if root is not an object', function () {
    try {
      expandWildcardKeypath(null, [], '*')
    } catch (err) {
      assert.strictEqual(err.name, 'EINVALID_ARGUMENT')
      assert.strictEqual(err.message, 'root must be an object or array')
    }
  })

  it('expandWildCardKeyPath should throw if keypaths is not an array of arrays or strings', function () {
    try {
      expandWildcardKeypath({}, [false], '*')
    } catch (err) {
      assert.strictEqual(err.name, 'EINVALID_ARGUMENT')
      assert.strictEqual(err.message, 'keypaths must be strings or arrays of strings')
    }
  })

  it('should recognize a keys option loop placeholder', function (done) {
    msCommon('test/fixtures/array-index-keys')
      .use(
        markdown({
          keys: ['arr.*', 'objarr.*.prop', 'wildcard.faq.*.*', 'wildcard.titles.*'],
          wildcard: '*',
          smartypants: true
        })
      )
      .build(function (err, files) {
        if (err) return done(err)
        const expectedFlat = ['<p><em>one</em></p>\n', '<p><em>two</em></p>\n', '<p><em>three</em></p>\n']
        const expected = [
          { prop: '<p><em>one</em></p>\n' },
          { prop: '<p><em>two</em></p>\n' },
          { prop: '<p><strong>three</strong></p>\n' }
        ]
        const expectedWildcards = {
          faq: [
            { q: '<p><strong>Question1?</strong></p>\n', a: '<p><em>answer1</em></p>\n' },
            { q: '<p><strong>Question2?</strong></p>\n', a: '<p><em>answer2</em></p>\n' }
          ],
          titles: {
            first: '<h1 id="first">first</h1>\n',
            second: '<h2 id="second">second</h2>\n',
            third: null
          }
        }
        assert.deepStrictEqual(files['index.html'].objarr, expected)
        assert.deepStrictEqual(files['index.html'].arr, expectedFlat)
        assert.deepStrictEqual(files['index.html'].wildcard, expectedWildcards)
        done()
      })
  })
})
