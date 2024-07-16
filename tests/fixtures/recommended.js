import markdown from "../../src/index.js";
import js from "@eslint/js";

export default [
    js.configs.recommended,
    ...markdown.configs.recommended,
    {
        "rules": {
            "no-console": "error"
        }
    }

];
