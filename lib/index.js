/**
 * @fileoverview Enables the processor for Markdown file extensions.
 * @author Brandon Mills
 */

"use strict";

const processor = require("./processor");

module.exports = {
    configs: {
        recommended: {
            plugins: ["markdown"],
            overrides: [
                {
                    files: ["*.md"],
                    processor: "markdown/markdown"
                }
            ]
        }
    },
    processors: {
        markdown: processor
    }
};
