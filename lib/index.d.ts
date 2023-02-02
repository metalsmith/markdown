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
     * - Key names of file metadata to render to HTML - can be nested
     */
    keys?: string[];
    /**
     * - Expand `*` wildcards in keypaths
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
