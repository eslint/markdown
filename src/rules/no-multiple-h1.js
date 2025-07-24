/**
 * @fileoverview Rule to enforce at most one H1 heading in Markdown.
 * @author Pixel998
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { ELEMENT_NODE, parse, walkSync } from "ultrahtml";
import { findOffsets, frontmatterHasTitle } from "../util.js";

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
				const ast = parse(node.value);

				walkSync(ast, htmlNode => {
					if (
						htmlNode.type === ELEMENT_NODE &&
						htmlNode.name.toLowerCase() === "h1"
					) {
						h1Count++;
						if (h1Count > 1) {
							const startOffset = htmlNode.loc[0].start;
							const endOffset = htmlNode.loc[1].end;

							const {
								lineOffset: startLineOffset,
								columnOffset: startColumnOffset,
							} = findOffsets(node.value, startOffset);

							const {
								lineOffset: endLineOffset,
								columnOffset: endColumnOffset,
							} = findOffsets(node.value, endOffset);

							const nodeStartLine = node.position.start.line;
							const nodeStartColumn = node.position.start.column;
							const startLine = nodeStartLine + startLineOffset;
							const endLine = nodeStartLine + endLineOffset;
							const startColumn =
								(startLine === nodeStartLine
									? nodeStartColumn
									: 1) + startColumnOffset;
							const endColumn =
								(endLine === nodeStartLine
									? nodeStartColumn
									: 1) + endColumnOffset;

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
				});
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
