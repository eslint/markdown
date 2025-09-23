/**
 * @fileoverview Rule to enforce at most one H1 heading in Markdown.
 * @author Pixel998
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import {
	findOffsets, // TODO
	frontmatterHasTitle,
	stripHtmlComments,
} from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"multipleH1"} NoMultipleH1MessageIds
 * @typedef {[{ frontmatterTitle?: string }]} NoMultipleH1Options
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoMultipleH1Options, MessageIds: NoMultipleH1MessageIds }>} NoMultipleH1RuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const h1TagPattern = /<h1[^>]*>[\s\S]*?<\/h1>/giu;

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
			{
				frontmatterTitle:
					"^(?!\\s*['\"]title[:=]['\"])\\s*\\{?\\s*['\"]?title['\"]?\\s*[:=]",
			},
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
				const text = stripHtmlComments(node.value);

				let match;
				while ((match = h1TagPattern.exec(text)) !== null) {
					h1Count++;
					if (h1Count > 1) {
						const {
							lineOffset: startLineOffset,
							columnOffset: startColumnOffset,
						} = findOffsets(node.value, match.index); // TODO

						const {
							lineOffset: endLineOffset,
							columnOffset: endColumnOffset,
						} = findOffsets(
							node.value,
							match.index + match[0].length,
						); // TODO

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
