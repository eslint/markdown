import markdown from "../../src/index.js";
import globals from "globals";

export default [
	{
		plugins: {
			markdown,
		},
		languageOptions: {
			globals: globals.browser,
		},
		rules: {
			"eol-last": "error",
			"no-console": "error",
			"no-undef": "error",
			quotes: "error",
			"spaced-comment": "error",
		},
	},
	{
		files: ["*.md", "*.mkdn", "*.mdown", "*.markdown", "*.custom"],
		processor: "markdown/markdown",
	},
];
