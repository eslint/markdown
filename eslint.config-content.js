import { defineConfig, globalIgnores } from "eslint/config";
import markdown from "./src/index.js";

export default defineConfig([
	globalIgnores(
		["**/*.js", "**/.cjs", "**/.mjs", "**/tests/fixtures/**"],
		"markdown/content/ignores",
	),

	markdown.configs.recommended,
]);
