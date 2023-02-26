/* eslint-env node, mocha */

const assert = require('assert')
const equal = require('assert-dir-equal')
const Metalsmith = require('metalsmith')
const { name } = require('../package.json')
/** @type {import('../lib').default} */
/* eslint-disable-next-line n/no-missing-require */
const markdown = require('..')
const markdownIt = require('markdown-it')
let expandWildcardKeypath
const path = require('path')

function msCommon(dir) {
  return Metalsmith(dir).env('DEBUG', process.env.DEBUG)
}

describe('@metalsmith/markdown', function () {
  before(function (done) {
    import('../src/expand-wildcard-keypath.js').then(imported => {
      expandWildcardKeypath = imported.default
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
          engineOptions: {
            smartypants: true
          }
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

  it('should make globalRefs available to all files', function (done) {
    msCommon('test/fixtures/globalrefs')
      .use(markdown({
        keys: ['frontmatter_w_markdown'],
        globalRefs:{
          'core_plugin_layouts': 'https://github.com/metalsmith/layouts',
          'core_plugin_in-place': 'https://github.com/metalsmith/in-place',
          'core_plugin_collections': 'https://github.com/metalsmith/collections',
          'core_plugin_markdown': 'https://github.com/metalsmith/markdown "with title"'
        }
      }))
      .build((err, files) => {
        if (err) done(err)
        try {
          assert.strictEqual(files['index.html'].frontmatter_w_markdown, '<p><a href="https://github.com/metalsmith/markdown" title="with title">markdown</a></p>\n')
          equal('test/fixtures/globalrefs/build', 'test/fixtures/globalrefs/expected')
          done()
        } catch(err) {
          done(err)
        }
      })
  })

  it('should load globalRefs from a JSON source file', function (done) {
    msCommon('test/fixtures/globalrefs-meta')
      .metadata({
        global: {
          links: {
          'core_plugin_layouts': 'https://github.com/metalsmith/layouts',
          'core_plugin_in-place': 'https://github.com/metalsmith/in-place',
          'core_plugin_collections': 'https://github.com/metalsmith/collections',
          'core_plugin_markdown': 'https://github.com/metalsmith/markdown "with title"'
        }
        }
      })
      .use(markdown({
        globalRefs: 'global.links'
      }))
      .build((err) => {
        if (err) done(err)
        try {
          equal('test/fixtures/globalrefs-meta/build', 'test/fixtures/globalrefs-meta/expected')
          done()
        } catch(err) {
          done(err)
        }
      })
  })

  it('should throw when the globalRefs metadata key is not found', function (done) {
    msCommon('test/fixtures/globalrefs-meta')
      .use(markdown({
        globalRefs: 'not_found'
      }))
      .process((err) => {
        try  {
          assert(err instanceof Error)
          assert(err.name, 'Error @metalsmith/markdown')
          assert(err.message, 'globalRefs not found in metalsmith.metadata().not_found')
          done()
        } catch (err) {
          done(err)
        }
      })
  })

  it('should allow using any markdown parser through the render option', function (done) {
    /** @type {import('markdown-it')} */
    let mdIt 
    msCommon('test/fixtures/keys')
      .use(markdown({
        keys: ['custom'],
        render(source, opts, context) {
          if (!mdIt) mdIt = new markdownIt(opts)
          if (context.key == 'contents') return mdIt.render(source)
          return mdIt.renderInline(source)
        }
      }))
      .process((err, files) => {
        if (err) done(err)
        try {
          assert.strictEqual(files['index.html'].custom, '<em>a</em>')
          assert.strictEqual(files['index.html'].contents.toString(), [
            '<h1>A Markdown Post</h1>\n',
            '<p>With some &quot;amazing&quot;, <em>riveting</em>, <strong>coooonnnntent</strong>.</p>\n'
          ].join(''))
          done()
        }
         catch (err) {
          done(err)
        }
      })
  })

  it('should allow a "keys" option', function (done) {
    msCommon('test/fixtures/keys')
      .use(
        markdown({
          keys: ['custom'],
          engineOptions: {
            smartypants: true
          }
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
          engineOptions: {
            smartypants: true
          }
        })
      )
      .build(function (err, files) {
        if (err) return done(err)
        assert.equal('<h1 id="hello">Hello</h1>\n', files['index.html'].nested.key.path)
        done()
      })
  })

  it('should log a warning when a key is not renderable (= not a string)', done => {
    const ms = msCommon('test/fixtures/default')
    const output = []
    const Debugger = () => { }
    Object.assign(Debugger, {
      info: () => { },
      warn: (...args) => { output.push(['warn', ...args]) },
      error: () => {  }
    })

    ms
      .use(() => {
        ms.debug = () => Debugger
      })
      .use(markdown({
        keys: ['not_a_string']
      }))
      .process((err) => {
        if (err) done(err)
        try  {
          assert.deepStrictEqual(output.slice(0,1), [
            ['warn', 'Couldn\'t render key "%s" of file "%s": not a string', 'not_a_string', 'index.md']
          ])
          done()
        } catch (err) {
          done(err)
        }
      })
  })

  it('< v2.0.0 should move legacy engine options in object root to options.engineOptions', done => {
    const ms = msCommon('test/fixtures/basic')
    const output = []
    const Debugger = (...args) => { output.push(['log', ...args])}
    Object.assign(Debugger, {
      info: (...args) => { output.push(['info', ...args]) },
      warn: (...args) => { output.push(['warn', ...args]) },
      error: (...args) => { output.push(['error', ...args]) }
    })

    ms
      .use(() => {
        ms.debug = () => Debugger
      })
      .use(markdown({
        gfm: true,
        smartypants: false,
        engineOptions: {}
      }))
      .process((err) => {
        if (err) done(err)
        try  {
          assert.deepStrictEqual(output.slice(0,2), [
            ['warn', 'Starting from version 2.0 marked engine options will need to be specified as options.engineOptions'],
            ['warn', 'Moved engine options %s to options.engineOptions', 'gfm, smartypants']
          ])
          done()
        } catch (err) {
          done(err)
        }
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
          engineOptions: {
            smartypants: true
          }
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
