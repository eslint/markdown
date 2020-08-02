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
            parserOptions: {
                tsconfigRootDir: __dirname,
                project: ["./tsconfig.json"]
            },
            extends: [
                "plugin:@typescript-eslint/recommended",
                "plugin:@typescript-eslint/recommended-requiring-type-checking"
            ]
        },
    ]
};
