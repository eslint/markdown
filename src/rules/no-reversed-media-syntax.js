/**
 * @fileoverview Rule to prevent reversed link and image syntax in Markdown.
 * @author xbinaryx
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { Heading, Paragraph, TableCell, Html, Image, ImageReference, InlineCode, LinkReference } from "mdast";
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
	/(?<=(?<!\\)(?:\\{2})*)\((?<label>(?:\\.|[^()\\]|\([\s\S]*\))*)\)\[(?<url>(?:\\.|[^\]\\\r\n])*)\](?!\()/dgu;

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

		/** @type {string[]} */
		let buffer;
		/** @type {number} */
		let parentNodeStartOffset;

		return {
			"heading, paragraph, tableCell"(
				/** @type {Heading | Paragraph | TableCell} */ node,
			) {
				// Initialize `buffer` with the full character array of the node text.
				buffer = Array.from(sourceCode.getText(node));

				// Store the start offset of the parent node for later calculations.
				parentNodeStartOffset = node.position.start.offset;
			},

			":matches(heading, paragraph, tableCell) :matches(html, image, imageReference, inlineCode, linkReference)"(
				/** @type {Html | Image | ImageReference | InlineCode | LinkReference} */ node,
			) {
				const [startOffset, endOffset] = sourceCode.getRange(node);

				for (let i = startOffset; i < endOffset; i++) {
					buffer[i - parentNodeStartOffset] = " ";
				}
			},

			":matches(heading, paragraph, tableCell):exit"(
				/** @type {Heading | Paragraph | TableCell} */ node,
			) {
				const maskedText = buffer.join("");
				const originalText = sourceCode.getText(node);

				/** @type {RegExpExecArray | null} */
				let match;

				while ((match = reversedPattern.exec(maskedText)) !== null) {
					const { label, url } = match.indices.groups;
					const startOffset = match.index + parentNodeStartOffset; // Adjust `reversedPattern` match index to the full source code.
					const endOffset = startOffset + match[0].length;

					context.report({
						loc: {
							start: sourceCode.getLocFromIndex(startOffset),
							end: sourceCode.getLocFromIndex(endOffset),
						},
						messageId: "reversedSyntax",
						fix(fixer) {
							return fixer.replaceTextRange(
								[startOffset, endOffset],
								`[${originalText.slice(...label)}](${originalText.slice(...url)})`,
							);
						},
					});
				}
			},
		};
	},
};
