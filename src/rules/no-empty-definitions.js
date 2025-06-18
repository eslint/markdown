/**
 * @fileoverview Rule to prevent empty definitions in Markdown.
 * @author Pixel998
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: []; }>}
 * NoEmptyDefinitionsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoEmptyDefinitionsRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow empty definitions",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-empty-definitions.md",
		},

		messages: {
			emptyDefinition: "Unexpected empty definition found.",
		},
	},

	create(context) {
		return {
			definition(node) {
				if (!node.url || node.url === "#") {
					context.report({
						loc: node.position,
						messageId: "emptyDefinition",
					});
				}
			},
		};
	},
};
