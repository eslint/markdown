/**
 * @fileoverview Rule to disallow using emphasis or strong as headings.
 * @author lumir(lumirlumir)
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { stripHtmlComments } from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { Emphasis, Strong, Text } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"noEmphasisAsHeadings"} NoEmphasisAsHeadingsMessageIds
 * @typedef {[{ punctuation?: string[] }]} NoEmphasisAsHeadingsOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoEmphasisAsHeadingsOptions, MessageIds: NoEmphasisAsHeadingsMessageIds }>} NoEmphasisAsHeadingsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const leadingOrTrailingWhitespacePattern = /^[ \t\r\n]+|[ \t\r\n]+$/gu;

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

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

		/** @type {string | null} */
		let lastText = null;
		let containerDepth = 0;
		let emphasisOrStrongDepth = 0;

		return {
			"blockquote, footnoteDefinition, listItem"() {
				containerDepth += 1;
			},

			"blockquote, footnoteDefinition, listItem:exit"() {
				containerDepth -= 1;
			},

			"emphasis, strong"() {
				if (emphasisOrStrongDepth === 0) {
					lastText = null;
				}

				emphasisOrStrongDepth += 1;
			},

			":matches(emphasis, strong) text"(/** @type {Text} */ { value }) {
				lastText = value;
			},

			":matches(emphasis, strong) :matches(image, inlineCode, inlineMath)"() {
				// Inline code and inline math are content, but their punctuation is ignored.
				lastText = "";
			},

			"emphasis, strong:exit"(/** @type {Emphasis | Strong} */ node) {
				emphasisOrStrongDepth -= 1;

				if (
					containerDepth > 0 ||
					emphasisOrStrongDepth > 0 ||
					lastText === null ||
					punctuation.some(character => lastText.endsWith(character))
				) {
					// Early return if:
					// 1. The node is inside a container.
					// 2. The node is inside another emphasis or strong node.
					// 3. The node does not contain text.
					// 4. The text ends with specified punctuation.
					return;
				}

				const parentNode = sourceCode.getParent(node);

				if (
					parentNode.type !== "paragraph" ||
					parentNode.position.start.line !==
						parentNode.position.end.line
				) {
					return;
				}

				const nodeText = stripHtmlComments(sourceCode.getText(node));
				const parentText = stripHtmlComments(
					sourceCode.getText(parentNode),
				).replace(leadingOrTrailingWhitespacePattern, "");

				if (nodeText === parentText) {
					context.report({
						node,
						messageId: "noEmphasisAsHeadings",
					});
				}
			},
		};
	},
});
