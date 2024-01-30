"use strict";

module.exports = [
    ...require("eslint-config-eslint").map(config => ({
        ...config,
        files: ["**/*.js"]
    })),
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
        files: ["**/*.js"],
        languageOptions: {
            sourceType: "commonjs"
        }
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
            "lines-around-comment": "off"
        }
    }
];
