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
		linterOptions: {
			reportUnusedDisableDirectives: "off",
		},
		rules: {
			"dot-notation": "error",
			"no-console": "error",
			"no-undef": "error",
			"no-warning-comments": ["error", { terms: ["eslint-disable"] }],
			yoda: "error",
		},
	},
	{
		files: ["*.md", "*.mkdn", "*.mdown", "*.markdown", "*.custom"],
		processor: "markdown/markdown",
	},
];
