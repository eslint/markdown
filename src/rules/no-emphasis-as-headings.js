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

		/** @type {string[]} */
		const emphasisStrongTextStack = [];

		let containerDepth = 0;

		return {
			"blockquote, footnoteDefinition, listItem"() {
				containerDepth += 1;
			},

			"blockquote, footnoteDefinition, listItem:exit"() {
				containerDepth -= 1;
			},

			"emphasis, strong"() {
				emphasisStrongTextStack.push("");
			},

			":matches(emphasis, strong) text"({ value }) {
				for (
					let index = 0;
					index < emphasisStrongTextStack.length;
					index++
				) {
					emphasisStrongTextStack[index] += value;
				}
			},

			"emphasis, strong:exit"(/** @type {Emphasis | Strong} */ node) {
				// Always pop before ignoring containers so tracked entries do not
				// accumulate and make later text processing quadratic.
				const text = emphasisStrongTextStack.pop();

				if (
					containerDepth > 0 ||
					punctuation.some(character => text.endsWith(character))
				) {
					// Early return if inside a container or
					// if the text ends with specified punctuation.
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
