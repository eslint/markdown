const markdown = require("../../");
const globals = require("globals");

module.exports = [
    {
        plugins: {
            markdown
        },
        languageOptions: {
            globals: globals.browser
        },
        rules: {
            "eol-last": "error",
            "no-console": "error",
            "no-undef": "error",
            "quotes": "error",
            "spaced-comment": "error"
        }
    },
    {
        "files": ["*.md", "*.mkdn", "*.mdown", "*.markdown", "*.custom"],
        "processor": "markdown/markdown"
    }
];
