import js from "@eslint/js";
import markdown from "../../src/index.js";
import tseslint from "typescript-eslint";

export default tseslint.config(
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
