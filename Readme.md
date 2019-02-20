# metalsmith-markdown

[![npm version][npm-badge]][npm-url]
[![code style: prettier][prettier-badge]][prettier-url]
[![metalsmith: core plugin][metalsmith-badge]][metalsmith-url]

[![Known Vulnerabilities][snyk-badge]][synk-url]

A Metalsmith plugin to convert markdown files.

## Installation

```bash
$ npm install metalsmith-markdown
```

## CLI Usage

  Install via npm and then add the `metalsmith-markdown` key to your `metalsmith.json` plugins with any [Marked](https://github.com/markedjs/marked) options you want, like so:

```json
{
  "plugins": {
    "metalsmith-markdown": {
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

## Javascript Usage

  Pass `options` to the markdown plugin and pass it to Metalsmith with the `use` method:

```js
var markdown = require('metalsmith-markdown');
var highlighter = require('highlighter');

metalsmith.use(markdown({
  highlight: function(code) {
    return require('highlight.js').highlightAuto(code).value;
  },
  pedantic: false,
  gfm: true,
  tables: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
}));
```

## Custom Renderer

  `metalsmith-markdown` uses `marked`, so to create a custom renderer get an instance of `marked.Renderer()`

```js
var markdown = require('metalsmith-markdown');
var marked = require('marked');
var markdownRenderer = new marked.Renderer();

markdownRenderer.image = function (href, title, text) {
return `
  <figure>
    <img src="${href}" alt="${title}" title="${title}" />
    <figcaption>
      <p>${text}</p>
    </figcaption>
  </figure>`;
};

metalsmith.use(markdown({
  renderer: markdownRenderer,
  pedantic: false,
  gfm: true,
  tables: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
}));
```

## History

[History](./History.md#Latest)

## License

MIT

[npm-badge]: https://img.shields.io/npm/v/metalsmith-markdown.svg
[npm-url]: https://www.npmjs.com/package/metalsmith-markdown
[prettier-badge]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?longCache=true
[prettier-url]: https://github.com/prettier/prettier
[metalsmith-badge]: https://img.shields.io/badge/metalsmith-core_plugin-green.svg?longCache=true
[metalsmith-url]: http://metalsmith.io
[snyk-badge]: https://snyk.io/test/github/segmentio/metalsmith-markdown/badge.svg?targetFile=package.json
[synk-url]: https://snyk.io/test/github/segmentio/metalsmith-markdown?targetFile=package.json
