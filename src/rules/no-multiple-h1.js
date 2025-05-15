/**
 * @fileoverview Rule to enforce at most one h1 heading in Markdown.
 * @author Pixel998
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: []; }>}
 * NoMultipleH1RuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoMultipleH1RuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow multiple h1 headings in the same document",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-multiple-h1.md",
		},

		messages: {
			multipleH1: "More than one h1 heading found.",
		},
	},

	create(context) {
		let h1Count = 0;

		return {
			heading(node) {
				if (node.depth === 1) {
					h1Count++;
					if (h1Count > 1) {
						context.report({
							loc: node.position,
							messageId: "multipleH1",
						});
					}
				}
			},
		};
	},
};
