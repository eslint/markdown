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
 * @import { Emphasis, Strong } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"noEmphasisAsHeadings"} NoEmphasisAsHeadingsMessageIds
 * @typedef {[{ punctuation?: string[] }]} NoEmphasisAsHeadingsOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoEmphasisAsHeadingsOptions, MessageIds: NoEmphasisAsHeadingsMessageIds }>} NoEmphasisAsHeadingsRuleDefinition
 */

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

		/** @type {string[]} */
		const emphasisStrongTextStack = [];

		let ignoredContainerDepth = 0;

		return {
			"blockquote, footnoteDefinition, listItem"() {
				ignoredContainerDepth += 1;
			},

			"blockquote, footnoteDefinition, listItem:exit"() {
				ignoredContainerDepth -= 1;
			},

			"emphasis, strong"() {
				emphasisStrongTextStack.push("");
			},

			":matches(emphasis, strong) *:not(html)"({ value }) {
				// TODO: handle `inlineCode` and `inlineMath`?
				for (
					let index = 0;
					index < emphasisStrongTextStack.length;
					index++
				) {
					emphasisStrongTextStack[index] += value ?? "";
				}
			},

			"emphasis, strong:exit"(/** @type {Emphasis | Strong} */ node) {
				const text = emphasisStrongTextStack.pop();

				if (ignoredContainerDepth > 0) {
					// Early return if inside an ignored container.
					return;
				}

				if (punctuation.some(character => text.endsWith(character))) {
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

				const parentText = stripHtmlComments(
					sourceCode.getText(parentNode),
				).trim(); // TODO: `trim()` is not markdown spec compliant.

				if (parentText === sourceCode.getText(node)) {
					context.report({
						node,

						messageId: "noEmphasisAsHeadings",
					});
				}
			},
		};
	},
});
