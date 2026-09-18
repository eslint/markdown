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

		/** @type {Array<string | undefined>} */
		const lastTextStack = [];

		let containerDepth = 0;

		return {
			"blockquote, footnoteDefinition, listItem"() {
				containerDepth += 1;
			},

			"blockquote, footnoteDefinition, listItem:exit"() {
				containerDepth -= 1;
			},

			"emphasis, strong"() {
				lastTextStack.push(undefined);
			},

			":matches(emphasis, strong) text"({ value }) {
				lastTextStack[lastTextStack.length - 1] = value;
			},

			":matches(emphasis, strong) :matches(inlineCode, inlineMath)"() {
				// Inline code and inline math are content, but their punctuation is ignored.
				lastTextStack[lastTextStack.length - 1] = "";
			},

			"emphasis, strong:exit"(/** @type {Emphasis | Strong} */ node) {
				// Always pop before ignoring containers so tracked entries do not
				// accumulate and make later text processing quadratic.
				const lastText = lastTextStack.pop();

				if (lastText !== undefined && lastTextStack.length > 0) {
					// Propagate the last plain-text descendant to the parent.
					lastTextStack[lastTextStack.length - 1] = lastText;
				}

				if (
					containerDepth > 0 ||
					(lastText !== undefined &&
						punctuation.some(character =>
							lastText.endsWith(character),
						))
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
