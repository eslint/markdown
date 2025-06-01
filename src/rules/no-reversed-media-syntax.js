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

const reversedPattern = /(?<!\\)\(((?:\\.|[^()\\])*)\)\[((?:\\.|[^\]\\])*)\]/gu;

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
			text(node) {
				const text = context.sourceCode.getText(node);
				let match;

				while ((match = reversedPattern.exec(text)) !== null) {
					const [reversedSyntax, label, url] = match;
					const matchIndex = match.index;
					const matchLength = reversedSyntax.length;

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
