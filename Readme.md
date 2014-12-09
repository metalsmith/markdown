
# metalsmith-markdown

  A Metalsmith plugin to convert markdown files.

## Installation

    $ npm install metalsmith-markdown

## CLI Usage

  Install via npm and then add the `metalsmith-markdown` key to your `metalsmith.json` plugins with any [Marked](https://github.com/chjj/marked) options you want, like so:

```json
{
  "plugins": {
    "metalsmith-markdown": {
      "smartypants": true,
      "gfm": true,
      "tables": true
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
  tables: true
}));
```

## The `keys` option

If you'd like to use markdown in your frontmatter, just specify which keys
you'd like to convert.

```js
metalsmith.use(markdown({
  keys: ['text']
}));
```

Now nothing stops you to use markdown in your frontmatter.

```
---
custom: _a_
---

Body
```

## The `useMetadata` option

If you'd like to set file specific markdown options, you can achieve that
with the `useMetadata` option set to `true`.

```js
metalsmith.use(markdown({
  useMetadata: true
}));
```

Now you can pass options to the markdown converter by specifying them
in your frontmatter.

```
---
gfm: false
---

~~Mistaken text.~~
```

Even options in your global metalsmith metadata will be passed to the
markdown converter. This way you can specify specific markdown options
for a subtree.

## License

  MIT