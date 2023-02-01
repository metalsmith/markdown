import markdown, { EngineOptions } from '../lib'
import { Options as MarkdownItOptions } from 'markdown-it'

// custom engineOptions
const markdownItOptions:EngineOptions<MarkdownItOptions> = {
  typographer: true
}

// custom engineOptions & render function
markdown<MarkdownItOptions>({
  engineOptions: markdownItOptions,
  render(str, opts, context) {
    if (context.key === 'contents')
      return str
    return str
  }
})