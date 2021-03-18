"use strict";

module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: 2015
    },
    env: {
        node: true,
    },
    extends: [
        "eslint:recommended",
    ],
    overrides: [
        {
            files: ["*.md"],
            extends: [
                "plugin:markdown/recommended",
                "plugin:mdx/recommended",
            ],
            plugins: ['mdx-plugin'],
            processor: 'mdx-plugin/remark',
            settings: {
                'mdx/code-blocks': true
            }
        },
    ]
};
