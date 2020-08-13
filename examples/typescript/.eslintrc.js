"use strict";

module.exports = {
    root: true,
    extends: [
        "eslint:recommended",
        "plugin:markdown/recommended",
    ],
    overrides: [
        {
            files: [".eslintrc.js"],
            env: {
                node: true
            }
        },
        {
            files: ["*.ts"],
            parser: "@typescript-eslint/parser",
            extends: ["plugin:@typescript-eslint/recommended"]
        },
    ]
};
