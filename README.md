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

Additionally, you can render markdown to HTML in file metadata keys by specifying the `keys` option:

```js
metalsmith.use(
  markdown({
    keys: ['html_desc']
  })
)
```

A file `article.md` with front-matter:

```md
---
html_desc: A **markdown-enabled** _description_
---
```

would transform `html_desc` to `A <b>markdown-enabled</b> <i>description</i>`.

### Custom markdown rendering

You can use a custom renderer by of `marked.Renderer()`

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
[ci-badge]: https://app.travis-ci.com/metalsmith/markdown.svg?branch=master
[ci-url]: https://app.travis-ci.com/github/metalsmith/markdown
[metalsmith-badge]: https://img.shields.io/badge/metalsmith-core_plugin-green.svg?longCache=true
[metalsmith-url]: https://metalsmith.io
[codecov-badge]: https://img.shields.io/coveralls/github/metalsmith/markdown
[codecov-url]: https://coveralls.io/github/metalsmith/markdown
[license-badge]: https://img.shields.io/github/license/metalsmith/markdown
[license-url]: LICENSE
