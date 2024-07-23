
import js from "@eslint/js";
import markdown from "../../src/index.js";
import globals from "globals";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";

export default [
    js.configs.recommended,
    ...markdown.configs.recommended,
    reactRecommended,
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
