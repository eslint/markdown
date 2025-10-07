/**
 * @fileoverview Rule to prevent reversed link and image syntax in Markdown.
 * @author xbinaryx
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { SourceRange } from "@eslint/core"
 * @import { Heading, Paragraph, TableCell, Html, Image, ImageReference, InlineCode } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"reversedSyntax"} NoReversedMediaSyntaxMessageIds
 * @typedef {[]} NoReversedMediaSyntaxOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoReversedMediaSyntaxOptions, MessageIds: NoReversedMediaSyntaxMessageIds }>} NoReversedMediaSyntaxRuleDefinition
 */

// TODO: FootnoteReference, (html), (image), (imageReference), (inlineCode), link, linkReference

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/** Matches reversed link/image syntax like `(text)[url]`, ignoring escaped characters like `\(text\)[url]`. */
const reversedPattern =
	/(?<=(?<!\\)(?:\\{2})*)\((?<label>(?:\\.|[^()\\]|\([\s\S]*\))*)\)\[(?<url>(?:\\.|[^\]\\\n])*)\](?!\()/gu;

/**
 * Checks if a match is within any skip range
 * @param {number} matchIndex The index of the match
 * @param {Array<SourceRange>} skipRanges The skip ranges
 * @returns {boolean} True if the match is within a skip range
 */
function isInSkipRange(matchIndex, skipRanges) {
	return skipRanges.some(
		range => range[0] <= matchIndex && matchIndex < range[1],
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
		const { sourceCode } = context;

		/** @type {Array<SourceRange>} */
		const skipRanges = [];

		/**
		 * Finds reversed link/image syntax in a node.
		 * @param {Heading | Paragraph | TableCell} node The node to check.
		 * @returns {void} Reports any reversed syntax found.
		 */
		function findReversedMediaSyntax(node) {
			const text = sourceCode.getText(node);

			/** @type {RegExpExecArray} */
			let match;

			while ((match = reversedPattern.exec(text)) !== null) {
				const { label, url } = match.groups;
				const startOffset = match.index + node.position.start.offset; // Adjust `reversedPattern` match index to the full source code.
				const endOffset = startOffset + match[0].length;

				if (isInSkipRange(startOffset, skipRanges)) {
					continue;
				}

				context.report({
					loc: {
						start: sourceCode.getLocFromIndex(startOffset),
						end: sourceCode.getLocFromIndex(endOffset),
					},
					messageId: "reversedSyntax",
					fix(fixer) {
						return fixer.replaceTextRange(
							[startOffset, endOffset],
							`[${label}](${url})`,
						);
					},
				});
			}
		}

		return {
			":matches(heading, paragraph, tableCell) :matches(html, image, imageReference, inlineCode)"(
				/** @type {Html | Image | ImageReference | InlineCode} */ node,
			) {
				skipRanges.push(sourceCode.getRange(node));
			},

			":matches(heading, paragraph, tableCell):exit"(
				/** @type {Heading | Paragraph | TableCell} */ node,
			) {
				findReversedMediaSyntax(node);
				skipRanges.length = 0;
			},
		};
	},
};
