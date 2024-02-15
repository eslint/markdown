"use strict";

const markdown = require("eslint-plugin-markdown");
const js = require("@eslint/js")
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
    js.configs.recommended,
    ...markdown.configs.recommended,
    {
        files: ["eslint.config.js"],
        languageOptions: {
            sourceType: "commonjs"
        }
    },
    ...tseslint.configs.recommended.map(config => ({
        ...config,
        files: ["**/*.ts"]
    }))
);
