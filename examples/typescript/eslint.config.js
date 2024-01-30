"use strict";

const markdown = require("../..");
const js = require("@eslint/js")
const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname
});

module.exports = [
    js.configs.recommended,
    ...markdown.configs.recommended,
    {
        files: ["eslint.config.js"],
        languageOptions: {
            sourceType: "commonjs"
        }
    },
    ...compat.config({
        parser: "@typescript-eslint/parser",
        extends: ["plugin:@typescript-eslint/recommended"]
    }).map(config => ({
        ...config,
        files: ["**/*.ts"]
    }))
];
