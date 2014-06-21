
# metalsmith-markdown

  A Metalsmith plugin to convert markdown files.

## Installation

    $ npm install metalsmith-markdown

## Options

  All [Marked](https://github.com/chjj/marked) options are supported.

  There is an additional optional option `markerAttribute` which specifies a page data attribute to set on all markdown files. This
  allows for templates to identify content that came from markdown vs html or some other templating language.

## CLI Usage

  Install via npm and then add the `metalsmith-markdown` key to your `metalsmith.json` plugins with any options you want, like so:

```json
{
  "plugins": {
    "metalsmith-markdown": {
      "smartypants": true,
      "gfm": true,
      "tables": true,
      "markerAttribute": "wasMarkdown"
    }
  }
}
```

## Javascript Usage

  Pass `options` to the markdown plugin and pass it to Metalsmith with the `use` method:

```js
var markdown = require('metalsmith-markdown');

metalsmith.use(markdown({
  smartypants: true,
  gfm: true,
  tables: true,
  markerAttribute: "wasMarkdown"
}));
```

## License

  MIT
