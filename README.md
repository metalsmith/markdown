# @metalsmith/markdown

A Metalsmith plugin to render markdown files to HTML, using [Marked](https://github.com/markedjs/marked) (by default).

[![metalsmith: core plugin][metalsmith-badge]][metalsmith-url]
[![npm: version][npm-badge]][npm-url]
[![ci: build][ci-badge]][ci-url]
[![code coverage][codecov-badge]][codecov-url]
[![license: MIT][license-badge]][license-url]

## Features

- Compiles `.md` and `.markdown` files in `metalsmith.source()` to HTML.
- Enables rendering file metadata keys to HTML through the [keys option](#rendering-file-metadata)
- Define a dictionary of markdown globalRefs (for links, images) available to all render targets
- Supports using the markdown library of your choice through the [render option](#using-another-markdown-library)

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

`@metalsmith/markdown` is powered by [Marked](https://github.com/markedjs/marked) (by default), and you can pass any of the [Marked options](https://marked.js.org/using_advanced#options) to it, including the ['pro' options](https://marked.js.org/using_pro#extensions): `renderer`, `tokenizer`, `walkTokens` and `extensions`.

```js
import markdown from '@metalsmith/markdown'
import hljs from 'highlight.js'

// use defaults
metalsmith.use(markdown())

// use explicit defaults
metalsmith.use({
  wildcard: false,
  keys: [],
  engineOptions: {}
})

// custom
metalsmith.use(
  markdown({
    engineOptions: {
      highlight: function (code) {
        return hljs.highlightAuto(code).value
      },
      pedantic: false,
      gfm: true,
      tables: true,
      breaks: false,
      sanitize: false,
      smartLists: true,
      smartypants: false,
      xhtml: false
    }
  })
)
```

`@metalsmith/markdown` provides the following options:

- `keys`: Key names of file metadata to render to HTML in addition to its `contents` - can be nested key paths
- `wildcard` _(default: `false`)_ - Expand `*` wildcards in `keys` option keypaths
- `globalRefs` - An object of `{ refname: 'link' }` pairs that will be available for all markdown files and keys, or a `metalsmith.metadata()` keypath containing such object
- `render` - Specify a custom render function with the signature `(source, engineOptions, context) => string`. `context` is an object with the signature `{ path:string, key:string }` where the `path` key contains the current file path, and `key` contains the target metadata key.
- `engineOptions` Options to pass to the markdown engine (default [marked](https://github.com/markedjs/marked))

### Rendering file metadata

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
    { "q": "<p><strong>Question1?</strong></p>\n", "a": "<p><em>answer1</em></p>\n" },
    { "q": "<p><strong>Question2?</strong></p>\n", "a": "<p><em>answer2</em></p>\n" }
  ]
}
```

**Notes about the wildcard**

- It acts like the single bash globstar. If you specify `*` this would only match the properties at the first level of the metadata.
- If a wildcard keypath matches a key whose value is not a string, it will be ignored.
- It is set to `false` by default because it can incur some overhead if it is applied too broadly.

### Defining a dictionary of markdown globalRefs

Markdown allows users to define links in [reference style](https://www.markdownguide.org/basic-syntax/#reference-style-links) (`[]:`).  
In a Metalsmith build it may be especially desirable to be able to refer to some links globally. The `globalRefs` options allows this:

```js
metalsmith.use(
  markdown({
    globalRefs: {
      twitter_link: 'https://twitter.com/johndoe',
      github_link: 'https://github.com/johndoe',
      photo: '/assets/img/me.png'
    }
  })
)
```

Now _contents of any file or metadata key_ processed by @metalsmith/markdown will be able to refer to these links as `[My Twitter][twitter_link]` or `![Me][photo]`. You can also store the globalRefs object of the previous example in a `metalsmith.metadata()` key and pass its keypath as `globalRefs` option instead.

This enables a flow where you can load the refs into global metadata from a source file with [@metalsmith/metadata](https://github.com/metalsmith/metadata), and use them both in markdown and templating plugins like [@metalsmith/layouts](https://github.com/metalsmith/layouts):

```js
metalsith
  .metadata({
    global: {
      links: {
        twitter: 'https://twitter.com/johndoe',
        github: 'https://github.com/johndoe'
      }
    }
  })
  // eg in a markdown file: [My Twitter profile][twitter]
  .use(markdown({ globalRefs: 'global.links' }))
  // eg in a handlebars layout: {{ global.links.twitter }}
  .use(layouts())
```

### Custom markdown rendering

You can use a custom renderer by using `marked.Renderer()`

```js
import markdown from '@metalsmith/markdown'
import { marked } from 'marked'
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
    engineOptions: {
      renderer: markdownRenderer,
      pedantic: false,
      gfm: true,
      tables: true,
      breaks: false,
      sanitize: false,
      smartLists: true,
      smartypants: false,
      xhtml: false
    }
  })
)
```

### Using another markdown library

If you don't want to use marked, you can use another markdown rendering library through the `render` option. For example, this is how you could use [markdown-it](https://github.com/markdown-it/markdown-it) instead:

```js
import MarkdownIt from 'markdown-it'

let markdownIt
metalsmith.use(markdown({
  render(source, opts, context) {
    if (!markdownIt) markdownIt = new MarkdownIt(opts)
    if (context.key == 'contents') return mdIt.render(source)
    return markdownIt.renderInline(source)
  },
  // specify markdownIt options here
  engineOptions: { ... }
}))
```

### Debug

To enable debug logs, set the `DEBUG` environment variable to `@metalsmith/markdown*`:

```
metalsmith.env('DEBUG', '@metalsmith/markdown*')
```

### CLI Usage

Add `@metalsmith/markdown` key to your `metalsmith.json` plugins key

```json
{
  "plugins": {
    "@metalsmith/markdown": {
      "engineOptions": {
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
