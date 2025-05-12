/**
 * @fileoverview Rule to prevent images without an alternative text in Markdown.
 * @author Pixel998
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: []; }>}
 * NoEmptyAltTextRuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoEmptyAltTextRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow images without an alternative text",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-empty-alt-text.md",
		},

		messages: {
			emptyAltText: "Unexpected empty alternative text found.",
		},
	},

	create(context) {
		return {
			image(node) {
				if (node.alt.trim().length === 0) {
					context.report({
						loc: node.position,
						messageId: "emptyAltText",
					});
				}
			},

			imageReference(node) {
				if (node.alt.trim().length === 0) {
					context.report({
						loc: node.position,
						messageId: "emptyAltText",
					});
				}
			},
		};
	},
};
