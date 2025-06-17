/**
 * @fileoverview Rule to prevent unused definitions in Markdown.
 * @author 루밀LuMir(lumirlumir)
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: [{ allowDefinitions: string[], allowFootnoteDefinitions: string[]; }]; }>}
 * NoUnusedDefinitionsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoUnusedDefinitionsRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow unused definitions",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-unused-definitions.md",
		},

		messages: {
			unusedDefinition:
				"Unexpected duplicate definition `{{ identifier }}` found.",
			unusedFootnoteDefinition:
				"Unexpected duplicate footnote definition `{{ identifier }}` found.",
		},

		schema: [
			{
				type: "object",
				properties: {
					allowDefinitions: {
						type: "array",
						items: {
							type: "string",
						},
						uniqueItems: true,
					},
					allowFootnoteDefinitions: {
						type: "array",
						items: {
							type: "string",
						},
						uniqueItems: true,
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{
				allowDefinitions: ["//"],
				allowFootnoteDefinitions: [],
			},
		],
	},

	// eslint-disable-next-line no-unused-vars -- TODO
	create(context) {
		// TODO
	},
};
