import { marked } from 'marked';
import Metalsmith from 'metalsmith';

export default markdown;
export interface Options {
    /**
     * - Key names of file metadata to render to HTML - can be nested
     */
    keys?: string[];
    /**
     * - Expand `*` wildcards in keypaths
     */
    wildcard?: boolean;
    /**
     * Marked markdown [options](https://marked.js.org/using_advanced#options)
     */
    engineOptions?: marked.MarkedOptions
};
/**
 * A Metalsmith plugin to render markdown files to HTML
 */
declare function markdown(options?: Options): Metalsmith.Plugin;
