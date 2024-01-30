const markdown = require("../../");
const js = require("@eslint/js")

module.exports = [
    js.configs.recommended,
    ...markdown.configs.recommended,
    {
        "rules": {
            "no-console": "error"
        }
    }

];
