/**
 * @fileoverview Rule to enforce at most one H1 heading in Markdown.
 * @author Pixel998
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { findOffsets } from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: [{ frontmatterTitle?: string; }]; }>}
 * NoMultipleH1RuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const h1TagPattern = /(?<!<!--[\s\S]*?)<h1[^>]*>[\s\S]*?<\/h1>/giu;

/**
 * Checks if a frontmatter block contains a title matching the given pattern
 * @param {string} value The frontmatter content
 * @param {RegExp|null} pattern The pattern to match against
 * @returns {boolean} Whether a title was found
 */
function frontmatterHasTitle(value, pattern) {
	if (!pattern) {
		return false;
	}
	const lines = value.split("\n");
	for (const line of lines) {
		if (pattern.test(line)) {
			return true;
		}
	}
	return false;
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoMultipleH1RuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow multiple H1 headings in the same document",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-multiple-h1.md",
		},

		messages: {
			multipleH1: "Unexpected additional H1 heading found.",
		},

		schema: [
			{
				type: "object",
				properties: {
					frontmatterTitle: {
						type: "string",
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{ frontmatterTitle: "^\\s*['\"]?title['\"]?\\s*[:=]" },
		],
	},

	create(context) {
		const [{ frontmatterTitle }] = context.options;
		const titlePattern =
			frontmatterTitle === "" ? null : new RegExp(frontmatterTitle, "iu");
		let h1Count = 0;

		return {
			yaml(node) {
				if (frontmatterHasTitle(node.value, titlePattern)) {
					h1Count++;
				}
			},

			toml(node) {
				if (frontmatterHasTitle(node.value, titlePattern)) {
					h1Count++;
				}
			},

			json(node) {
				if (frontmatterHasTitle(node.value, titlePattern)) {
					h1Count++;
				}
			},

			html(node) {
				let match;
				while ((match = h1TagPattern.exec(node.value)) !== null) {
					h1Count++;
					if (h1Count > 1) {
						const {
							lineOffset: startLineOffset,
							columnOffset: startColumnOffset,
						} = findOffsets(node.value, match.index);

						const {
							lineOffset: endLineOffset,
							columnOffset: endColumnOffset,
						} = findOffsets(
							node.value,
							match.index + match[0].length,
						);

						const nodeStartLine = node.position.start.line;
						const nodeStartColumn = node.position.start.column;
						const startLine = nodeStartLine + startLineOffset;
						const endLine = nodeStartLine + endLineOffset;
						const startColumn =
							(startLine === nodeStartLine
								? nodeStartColumn
								: 1) + startColumnOffset;
						const endColumn =
							(endLine === nodeStartLine ? nodeStartColumn : 1) +
							endColumnOffset;

						context.report({
							loc: {
								start: {
									line: startLine,
									column: startColumn,
								},
								end: {
									line: endLine,
									column: endColumn,
								},
							},
							messageId: "multipleH1",
						});
					}
				}
			},

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
