# @metalsmith/markdown

A Metalsmith plugin to render markdown files to HTML, using [Marked](https://github.com/markedjs/marked).

[![metalsmith: core plugin][metalsmith-badge]][metalsmith-url]
[![npm: version][npm-badge]][npm-url]
[![ci: build][ci-badge]][ci-url]
[![code coverage][codecov-badge]][codecov-url]
[![license: MIT][license-badge]][license-url]

## Installation

NPM:

```bash
npm install @metalsmith/markdown
```

Yarn:

```bash
yarn add @metalsmith/markdown
```

## Usage

```js
const markdown = require('@metalsmith/markdown')

metalsmith.use(
  markdown({
    highlight: function (code) {
      return require('highlight.js').highlightAuto(code).value
    },
    pedantic: false,
    gfm: true,
    tables: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false
  })
)
```

### Options

`@metalsmith/markdown` is powered by [Marked](https://github.com/markedjs/marked), and you can pass any of the [Marked options](https://marked.js.org/using_advanced#options) to it, including the ['pro' options](https://marked.js.org/using_pro#extensions): `renderer`, `tokenizer`, `walkTokens` and `extensions`.

You can render markdown to HTML in file metadata keys by specifying the `keys` option.  
The `keys` option also supports dot-delimited key-paths.

```js
metalsmith.use(
  markdown({
    keys: ['html_desc', 'nested.data']
  })
)
```

You can even render all keys at a certain path by setting the `wildcard` option and using a globstar `*` in the keypaths.  
This is especially useful for arrays like the `faq` below:

```js
metalsmith.use(
  markdown({
    wildcard: true,
    keys: ['html_desc', 'nested.data', 'faq.*.*']
  })
)
```

A file `page.md` with front-matter:

```md
---
html_desc: A **markdown-enabled** _description_
nested:
  data: '#metalsmith'
faq:
  - q: '**Question1?**'
    a: _answer1_
  - q: '**Question2?**'
    a: _answer2_
---
```

would be transformed into:

```json
{
  "html_desc": "A <strong>markdown-enabled</strong> <em>description</em>\n",
  "nested": {
    "data": "<h1 id=\"metalsmith\">metalsmith</h1>\n"
  },
  "faq": [
    { "q": "<p><strong>Question1?</strong></p>\n", "a": "<p><em>answer1</em></p>\n"},
    { "q": "<p><strong>Question2?</strong></p>\n", "a": "<p><em>answer2</em></p>\n"}
  ],
```

**Notes about the wildcard**

- It acts like the single bash globstar. If you specify `*` this would only match the properties at the first level of the metadata.
- If a wildcard keypath matches a key whose value is not a string, it will be ignored.
- It is set to `false` by default because it can incur some overhead if it is applied too broadly.

### Custom markdown rendering

You can use a custom renderer by using `marked.Renderer()`

```js
const markdown = require('@metalsmith/markdown')
const marked = require('marked')
const markdownRenderer = new marked.Renderer()

markdownRenderer.image = function (href, title, text) {
  return `
  <figure>
    <img src="${href}" alt="${title}" title="${title}" />
    <figcaption>
      <p>${text}</p>
    </figcaption>
  </figure>`
}

metalsmith.use(
  markdown({
    renderer: markdownRenderer,
    pedantic: false,
    gfm: true,
    tables: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false
  })
)
```

### CLI Usage

Add `@metalsmith/markdown` key to your `metalsmith.json` plugins key

```json
{
  "plugins": {
    "@metalsmith/markdown": {
      "pedantic": false,
      "gfm": true,
      "tables": true,
      "breaks": false,
      "sanitize": false,
      "smartLists": true,
      "smartypants": false,
      "xhtml": false
    }
  }
}
```

## License

[MIT](LICENSE)

[npm-badge]: https://img.shields.io/npm/v/@metalsmith/markdown.svg
[npm-url]: https://www.npmjs.com/package/@metalsmith/markdown
[ci-badge]: https://github.com/metalsmith/markdown/actions/workflows/test.yml/badge.svg
[ci-url]: https://github.com/metalsmith/markdown/actions/workflows/test.yml
[metalsmith-badge]: https://img.shields.io/badge/metalsmith-core_plugin-green.svg?longCache=true
[metalsmith-url]: https://metalsmith.io
[codecov-badge]: https://img.shields.io/coveralls/github/metalsmith/markdown
[codecov-url]: https://coveralls.io/github/metalsmith/markdown
[license-badge]: https://img.shields.io/github/license/metalsmith/markdown
[license-url]: LICENSE
