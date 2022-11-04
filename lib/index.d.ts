import { marked } from 'marked';
import Metalsmith from 'metalsmith';

export default initMarkdown;
export interface Options extends marked.MarkedOptions {
    /**
     * - Key names of file metadata to render to HTML - can be nested
     */
    keys?: string[];
    /**
     * - Expand `*` wildcards in keypaths
     */
    wildcard?: boolean;
};
/**
 * A Metalsmith plugin to render markdown files to HTML
 * @param {Options} [options]
 * @return {import('metalsmith').Plugin}
 */
declare function initMarkdown(options?: Options): Metalsmith.Plugin;
