/**
 * @fileoverview Rule to disallow using fully bolded paragraphs as headings.
 * @author lumir(lumirlumir)
 */

// @ts-nocheck -- TODO

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"no-emphasis-as-heading"} NoEmphasisAsHeadingMessageIds
 * @typedef {[]} NoEmphasisAsHeadingOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoEmphasisAsHeadingOptions, MessageIds: NoEmphasisAsHeadingMessageIds }>} NoEmphasisAsHeadingRuleDefinition
 */

// --------------------------------------------------------------------------------
// Rule Definition
// --------------------------------------------------------------------------------

export default /** @satisfies {NoEmphasisAsHeadingRuleDefinition} */ ({
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow using fully bolded paragraphs as headings",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-emphasis-as-heading.md",
		},

		messages: {
			noEmphasisAsHeading:
				"Fully bolded paragraphs should not be used as headings. Please use a heading instead.",
		},

		// language: "markdown",

		// dialects: ["commonmark", "gfm"],
	},

	create(context) {
		return {
			strong(node) {
				const parentNode = context.sourceCode.getParent(node);
				const ancestorNode = context.sourceCode.getParent(parentNode);

				if (
					parentNode.type === "paragraph" &&
					ancestorNode.type !== "listItem" &&
					parentNode.position.start.line ===
						parentNode.position.end.line && // Should be a single line.
					parentNode.position.start.offset ===
						node.position.start.offset && // Should have the same start offset.
					parentNode.position.end.offset === node.position.end.offset // Should have the same end offset.
				) {
					context.report({
						node,

						messageId: "noEmphasisAsHeading",
					});
				}
			},
		};
	},
});
