/**
 * @fileoverview Rule to disallow using emphasis or strong as headings.
 * @author lumir(lumirlumir)
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { Emphasis, Strong } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"noEmphasisAsHeadings"} NoEmphasisAsHeadingsMessageIds
 * @typedef {[{ punctuation?: string[] }]} NoEmphasisAsHeadingsOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoEmphasisAsHeadingsOptions, MessageIds: NoEmphasisAsHeadingsMessageIds }>} NoEmphasisAsHeadingsRuleDefinition
 */

// --------------------------------------------------------------------------------
// Rule Definition
// --------------------------------------------------------------------------------

export default /** @satisfies {NoEmphasisAsHeadingsRuleDefinition} */ ({
	meta: {
		type: "problem",
		languages: ["markdown/commonmark", "markdown/gfm"],

		docs: {
			recommended: true,
			description: "Disallow using emphasis or strong as headings",
			dialects: ["CommonMark", "GFM"],
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-emphasis-as-headings.md",
		},

		messages: {
			noEmphasisAsHeadings:
				"Unexpected emphasis or strong used as a heading.",
		},

		schema: [
			{
				type: "object",
				properties: {
					punctuation: {
						type: "array",
						items: {
							type: "string",
							minLength: 1,
							maxLength: 1,
						},
						minItems: 1,
						uniqueItems: true,
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{
				punctuation: [
					".",
					",",
					";",
					":",
					"!",
					"?",
					"。",
					"\uFF0C", // `，`
					"\uFF1B", // `；`
					"\uFF1A", // `：`
					"\uFF01", // `！`
					"\uFF1F", // `？`
				],
			},
		],
	},

	create(context) {
		const { sourceCode } = context;
		const [{ punctuation }] = context.options;

		let ignoredContainerDepth = 0;

		return {
			"blockquote, footnoteDefinition, listItem"() {
				ignoredContainerDepth += 1;
			},

			"emphasis, strong"(/** @type {Emphasis | Strong} */ node) {
				if (ignoredContainerDepth > 0) {
					// Early return if inside an ignored container.
					return;
				}

				const count = node.type === "emphasis" ? 1 : 2;
				const text = sourceCode.getText(node, -count, -count);

				if (punctuation.includes(text.at(-1))) {
					return;
				}

				const parentNode = sourceCode.getParent(node);

				if (
					parentNode.type === "paragraph" &&
					parentNode.position.start.line ===
						parentNode.position.end.line && // Should be a single line.
					parentNode.position.start.offset ===
						node.position.start.offset && // Should have the same start offset.
					parentNode.position.end.offset === node.position.end.offset // Should have the same end offset.
				) {
					context.report({
						node,

						messageId: "noEmphasisAsHeadings",
					});
				}
			},

			"blockquote, footnoteDefinition, listItem:exit"() {
				ignoredContainerDepth -= 1;
			},
		};
	},
});
