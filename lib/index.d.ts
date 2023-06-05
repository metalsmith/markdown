import { marked } from "marked";
import { Plugin } from "metalsmith";
export type EngineOptions<T = marked.MarkedOptions> = T;

export default markdown;
export type Render<E> = (source: string, engineOptions: EngineOptions<E>, context: {
    path: string;
    key: string;
}) => string;

export type Options<E = marked.MarkedOptions> = {
    /**
     * - Array of file metadata key names or object with arrays of key names of file or global metadata key names to render to HTML - can be nested keypaths
     */
    keys?: string[] | {
      files: string[]
      global: string[]
    };
    /**
     * - Expand `*` wildcards in keypaths
     * @default false
     */
    wildcard?: boolean;
    /**
     * An object of `{ refname: 'link' }` pairs that will be  available for all markdown files and keys,
     * or a `metalsmith.metadata()` keypath containing such object
     */
    globalRefs?: { [key:string]: string };
    /**
     * - Specify a custom render function with the signature `(source, engineOptions, context) => string`.
     * `context` is an object with a `path` key containing the current file path, and `key` containing the target key.
     */
    render?: Render<E>;
    /**
     * Options to pass to the markdown engine (default [marked](https://github.com/markedjs/marked))
     */
    engineOptions?: EngineOptions<E>;
};

/**
 * A Metalsmith plugin to render markdown files to HTML
 */
declare function markdown<E = marked.MarkedOptions>(options?: Options<E>): Plugin;
