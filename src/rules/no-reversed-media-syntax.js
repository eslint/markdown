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
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: []; }>}
 * NoReversedMediaSyntaxRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/** Matches reversed link/image syntax like (text)[url], ignoring escaped characters like \(text\)[url]. */
const reversedPattern =
	/(?<!\\)\(((?:\\.|[^()\\])*)\)\[((?:\\.|[^\]\\\n])*)\](?!\()/gu;
const codeSpanPattern = /(?<!\\)`+[^`]*`+/gu;

/**
 * Checks if a match is within any of the code spans
 * @param {number} matchIndex The index of the match
 * @param {Array<{start: number, end: number}>} codeSpans Array of code span positions
 * @returns {boolean} True if the match is within a code span
 */
function isInCodeSpan(matchIndex, codeSpans) {
	return codeSpans.some(
		span => matchIndex >= span.start && matchIndex < span.end,
	);
}

/**
 * Finds all code spans in the text
 * @param {string} text The text to search
 * @returns {Array<{start: number, end: number}>} Array of code span positions
 */
function findCodeSpans(text) {
	const codeSpans = [];
	let match;

	while ((match = codeSpanPattern.exec(text)) !== null) {
		codeSpans.push({
			start: match.index,
			end: match.index + match[0].length,
		});
	}

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
				"Unexpected reversed syntax found. Use [{{label}}]({{url}}) instead.",
		},
	},

	create(context) {
		return {
			paragraph(node) {
				const text = context.sourceCode.getText(node);
				const codeSpans = findCodeSpans(text);
				let match;

				while ((match = reversedPattern.exec(text)) !== null) {
					const [reversedSyntax, label, url] = match;
					const matchIndex = match.index;
					const matchLength = reversedSyntax.length;

					if (isInCodeSpan(matchIndex, codeSpans)) {
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

					const nodeStartLine = node.position.start.line;
					const nodeStartColumn = node.position.start.column;
					const startLine = nodeStartLine + startLineOffset;
					const endLine = nodeStartLine + endLineOffset;
					const startColumn =
						(startLine === nodeStartLine ? nodeStartColumn : 1) +
						startColumnOffset;
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
						messageId: "reversedSyntax",
						data: {
							label,
							url,
						},
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
			},
		};
	},
};
