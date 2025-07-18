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

/** Matches reversed link/image syntax like (text)[url], ignoring escaped characters like \(text\)[url]. */
const reversedPattern =
	/(?<!\\)\(((?:\\.|[^()\\]|\([\s\S]*\))*)\)\[((?:\\.|[^\]\\\n])*)\](?!\()/gu;

/**
 * Checks if a match is within any of the code spans
 * @param {number} matchIndex The index of the match
 * @param {Array<{startOffset: number, endOffset: number}>} codeSpans Array of code span positions
 * @returns {boolean} True if the match is within a code span
 */
function isInCodeSpan(matchIndex, codeSpans) {
	return codeSpans.some(
		span => span.startOffset <= matchIndex && matchIndex < span.endOffset,
	);
}

/**
 * Finds all code spans in the node by traversing its children
 * @param {Heading | Paragraph | TableCell} node The node to search
 * @returns {Array<{startOffset: number, endOffset: number}>} Array of code span positions
 */
function findCodeSpans(node) {
	/** @type {Array<{startOffset: number, endOffset: number}>} */
	const codeSpans = [];

	/**
	 * Recursively traverses the AST to find inline code nodes
	 * @param {Node} currentNode The current node being traversed
	 * @returns {void}
	 */
	function traverse(currentNode) {
		if (currentNode.type === "inlineCode") {
			codeSpans.push({
				startOffset: currentNode.position.start.offset,
				endOffset: currentNode.position.end.offset,
			});
			return;
		}

		if ("children" in currentNode && Array.isArray(currentNode.children)) {
			currentNode.children.forEach(traverse);
		}
	}

	traverse(node);
	return codeSpans;
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
		/**
		 * Finds reversed link/image syntax in a node.
		 * @param {Heading | Paragraph | TableCell} node The node to check.
		 * @returns {void} Reports any reversed syntax found.
		 */
		function findReversedMediaSyntax(node) {
			const text = context.sourceCode.getText(node);
			const codeSpans = findCodeSpans(node);
			let match;

			while ((match = reversedPattern.exec(text)) !== null) {
				const [reversedSyntax, label, url] = match;
				const matchIndex = match.index;
				const matchLength = reversedSyntax.length;

				if (
					isInCodeSpan(
						matchIndex + node.position.start.offset,
						codeSpans,
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
			heading(node) {
				findReversedMediaSyntax(node);
			},

			paragraph(node) {
				findReversedMediaSyntax(node);
			},

			tableCell(node) {
				findReversedMediaSyntax(node);
			},
		};
	},
};
