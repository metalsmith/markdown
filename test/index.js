const assert = require('assert')
const equal = require('assert-dir-equal')
const Metalsmith = require('metalsmith')
const { describe, it } = require('mocha')
const { name } = require('../package.json')
const markdown = require('..')

describe('@metalsmith/markdown', function () {
  it('should export a named plugin function matching package.json name', function () {
    const namechars = name.split('/')[1]
    const camelCased = namechars.split('').reduce((str, char, i) => {
      str += namechars[i - 1] === '-' ? char.toUpperCase() : char === '-' ? '' : char
      return str
    }, '')
    assert.strictEqual(markdown().name, camelCased)
  })

  it('should not crash the metalsmith build when using default options', function (done) {
    Metalsmith('test/fixtures/default')
      .use(markdown())
      .build((err) => {
        assert.strictEqual(err, null)
        equal('test/fixtures/default/build', 'test/fixtures/default/expected')
        done()
      })
  })

  it('should convert markdown files', function (done) {
    Metalsmith('test/fixtures/basic')
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

  it('should allow a "keys" option', function (done) {
    Metalsmith('test/fixtures/keys')
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
    Metalsmith('test/fixtures/nested-keys')
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
})
