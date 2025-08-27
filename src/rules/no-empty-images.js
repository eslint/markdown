/**
 * @fileoverview Rule to prevent empty images in Markdown.
 * @author 루밀LuMir(lumirlumir)
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"emptyImage"} NoEmptyImagesMessageIds
 * @typedef {[]} NoEmptyImagesOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoEmptyImagesOptions, MessageIds: NoEmptyImagesMessageIds }>} NoEmptyImagesRuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoEmptyImagesRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow empty images",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-empty-images.md",
		},

		messages: {
			emptyImage: "Unexpected empty image found.",
		},
	},

	create(context) {
		return {
			image(node) {
				if (!node.url || node.url === "#") {
					context.report({
						loc: node.position,
						messageId: "emptyImage",
					});
				}
			},
		};
	},
};
