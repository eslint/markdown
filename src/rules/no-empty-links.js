/**
 * @fileoverview Rule to prevent empty links in Markdown.
 * @author Nicholas C. Zakas
 */
//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { MarkdownRuleDefinition } from "../types.ts";
 * @typedef {"emptyLink"} NoEmptyLinksMessageIds
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: [], MessageIds: NoEmptyLinksMessageIds }>} NoEmptyLinksRuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoEmptyLinksRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow empty links",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-empty-links.md",
		},

		messages: {
			emptyLink: "Unexpected empty link found.",
		},
	},

	create(context) {
		return {
			link(node) {
				if (!node.url || node.url === "#") {
					context.report({
						loc: node.position,
						messageId: "emptyLink",
					});
				}
			},
		};
	},
};
