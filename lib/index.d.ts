import { marked } from 'marked';
import Metalsmith from 'metalsmith';

export default markdown;
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
 */
declare function markdown(options?: Options): Metalsmith.Plugin;
