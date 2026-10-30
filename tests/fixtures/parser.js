import markdown from "../../src/index.js";

export default [
	{
		files: ["**/*.md"],
		plugins: { markdown },
		language: "markdown/commonmark",
		languageOptions: {
			parser: {
				parse() {
					throw new Error(
						"The configured Markdown parser was called.",
					);
				},
			},
		},
		rules: {
			"markdown/heading-increment": "error",
		},
	},
];
