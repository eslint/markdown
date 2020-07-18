"use strict";

module.exports = {
    root: true,
    extends: [
        "eslint:recommended",
        "plugin:markdown/recommended",
        "plugin:react/recommended",
    ],
    settings: {
        react: {
            version: "16.8.0"
        }
    },
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 2015,
        sourceType: "module"
    },
    env: {
        browser: true,
        es6: true
    },
    overrides: [
        {
            files: [".eslintrc.js"],
            env: {
                node: true
            }
        },
        {
            files: ["**/*.md/*.jsx"],
            globals: {
                // For code examples, `import React from "react";` at the top
                // of every code block is distracting, so pre-define the
                // `React` global.
                React: false
            },
        }
    ]
};
