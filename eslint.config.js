"use strict";

module.exports = [
    ...require("eslint-config-eslint/cjs").map(config => ({
        ...config,
        files: ["**/*.js", "**/*.mjs"]
    })),
    {
        files: ["**/*.mjs"],
        languageOptions: {
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true
                }
            }
        }
    },
    {
        plugins: {
            markdown: require(".")
        }
    },
    {
        ignores: [
            "**/examples",
            "**/coverage",
            "**/tests/fixtures"
        ]
    },
    {
        files: ["tests/**/*.js"],
        languageOptions: {
            globals: {
                ...require("globals").mocha
            }
        }
    },
    {
        files: ["**/*.md"],
        processor: "markdown/markdown"
    },
    {
        files: ["**/*.md/*.js"],
        languageOptions: {
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true
                }
            }
        },
        rules: {
            "lines-around-comment": "off",
            "n/no-missing-import": "off"
        }
    }
];
