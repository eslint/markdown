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
                    processor: "markdown/markdown",
                    parserOptions: {
                        ecmaFeatures: {
                            impliedStrict: true
                        }
                    },
                    rules: {
                        "eol-last": "off",
                        "no-undef": "off",
                        "no-unused-expressions": "off",
                        "no-unused-vars": "off",
                        "padded-blocks": "off",
                        strict: "off",
                        "unicode-bom": "off"
                    }
                }
            ]
        }
    },
    processors: {
        markdown: processor
    }
};
