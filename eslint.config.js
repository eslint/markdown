import globals from "globals";
import eslintConfigESLint from "eslint-config-eslint";
import eslintConfigESLintFormatting from "eslint-config-eslint/formatting";
import markdown from "./src/index.js";

export default [
    ...eslintConfigESLint,
    eslintConfigESLintFormatting,
    {
        plugins: {
            markdown
        }
    },
    {
        ignores: [
            "**/examples",
            "**/coverage",
            "**/tests/fixtures",
            "dist"
        ]
    },
    {
        files: ["tests/**/*.js"],
        languageOptions: {
            globals: {
                ...globals.mocha
            }
        },
        rules: {
            "no-underscore-dangle": "off"
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
            "n/no-missing-import": "off",
            "no-var": "off",
            "padding-line-between-statements": "off",
            "no-console": "off",
            "no-alert": "off",
            "@eslint-community/eslint-comments/require-description": "off",
            "jsdoc/require-jsdoc": "off"
        }
    }
];
