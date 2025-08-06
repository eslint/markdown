/**
 * @fileoverview Rule to prevent reversed link and image syntax in Markdown.
 * @author xbinaryx
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { findOffsets } from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { Node, Heading, Paragraph, TableCell } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"reversedSyntax"} NoReversedMediaSyntaxMessageIds
 * @typedef {[]} NoReversedMediaSyntaxOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoReversedMediaSyntaxOptions, MessageIds: NoReversedMediaSyntaxMessageIds }>} NoReversedMediaSyntaxRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/** Matches reversed link/image syntax like `(text)[url]`, ignoring escaped characters like `\(text\)[url]`. */
const reversedPattern =
	/(?<!\\)\(((?:\\.|[^()\\]|\([\s\S]*\))*)\)\[((?:\\.|[^\]\\\n])*)\](?!\()/gu;

/**
 * Checks if a match is within any skip range
 * @param {number} matchIndex The index of the match
 * @param {Array<{startOffset: number, endOffset: number}>} skipRanges The skip ranges
 * @returns {boolean} True if the match is within a skip range
 */
function isInSkipRange(matchIndex, skipRanges) {
	return skipRanges.some(
		range =>
			range.startOffset <= matchIndex && matchIndex < range.endOffset,
	);
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoReversedMediaSyntaxRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow reversed link and image syntax",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-reversed-media-syntax.md",
		},

		fixable: "code",

		messages: {
			reversedSyntax:
				"Unexpected reversed syntax found. Use [label](URL) syntax instead.",
		},
	},

	create(context) {
		/** @type {Array<{startOffset: number, endOffset: number}>} */
		let skipRanges = [];

		/**
		 * Finds reversed link/image syntax in a node.
		 * @param {Heading | Paragraph | TableCell} node The node to check.
		 * @returns {void} Reports any reversed syntax found.
		 */
		function findReversedMediaSyntax(node) {
			const text = context.sourceCode.getText(node);
			let match;

			while ((match = reversedPattern.exec(text)) !== null) {
				const [reversedSyntax, label, url] = match;
				const matchIndex = match.index;
				const matchLength = reversedSyntax.length;

				if (
					isInSkipRange(
						matchIndex + node.position.start.offset,
						skipRanges,
					)
				) {
					continue;
				}

				const {
					lineOffset: startLineOffset,
					columnOffset: startColumnOffset,
				} = findOffsets(text, matchIndex);
				const {
					lineOffset: endLineOffset,
					columnOffset: endColumnOffset,
				} = findOffsets(text, matchIndex + matchLength);

				const baseColumn = 1;
				const nodeStartLine = node.position.start.line;
				const nodeStartColumn = node.position.start.column;
				const startLine = nodeStartLine + startLineOffset;
				const endLine = nodeStartLine + endLineOffset;
				const startColumn =
					(startLine === nodeStartLine
						? nodeStartColumn
						: baseColumn) + startColumnOffset;
				const endColumn =
					(endLine === nodeStartLine ? nodeStartColumn : baseColumn) +
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
					messageId: "reversedSyntax",
					fix(fixer) {
						const startOffset =
							node.position.start.offset + matchIndex;
						const endOffset = startOffset + matchLength;

						return fixer.replaceTextRange(
							[startOffset, endOffset],
							`[${label}](${url})`,
						);
					},
				});
			}
		}

		return {
			"heading html,inlineCode"(node) {
				skipRanges.push({
					startOffset: node.position.start.offset,
					endOffset: node.position.end.offset,
				});
			},

			"heading:exit"(node) {
				findReversedMediaSyntax(node);
				skipRanges = [];
			},

			"paragraph html,inlineCode"(node) {
				skipRanges.push({
					startOffset: node.position.start.offset,
					endOffset: node.position.end.offset,
				});
			},

			"paragraph:exit"(node) {
				findReversedMediaSyntax(node);
				skipRanges = [];
			},

			"tableCell html,inlineCode"(node) {
				skipRanges.push({
					startOffset: node.position.start.offset,
					endOffset: node.position.end.offset,
				});
			},

			"tableCell:exit"(node) {
				findReversedMediaSyntax(node);
				skipRanges = [];
			},
		};
	},
};
