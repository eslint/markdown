"use strict";

const { FlatCompat } = require("@eslint/eslintrc");
const markdown = require("eslint-plugin-markdown");
const js = require("@eslint/js");
const globals = require("globals");

const compat = new FlatCompat({
    baseDirectory: __dirname
});

module.exports = [
    js.configs.recommended,
    ...markdown.configs.recommended,
    require("eslint-plugin-react/configs/recommended"),
    {
        settings: {
            react: {
                version: "16.8.0"
            }
        },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            },
            ecmaVersion: 2015,
            sourceType: "module",
            globals: globals.browser
        }
    },
    {
        files: ["eslint.config.js"],
        languageOptions: {
            sourceType: "commonjs"
        }
    },
    {
        files: ["**/*.md/*.jsx"],
        languageOptions: {
            globals: {
                React: false
            }
        }
    }
];
