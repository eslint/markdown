/**
 * @fileoverview Rule to prevent spaces around emphasis markers in Markdown.
 * @author Pixel998
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { SourceRange } from "@eslint/core";
 * @import { Heading, Paragraph, TableCell, Text } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"spaceInEmphasis"} NoSpaceInEmphasisMessageIds
 * @typedef {[{ checkStrikethrough?: boolean }]} NoSpaceInEmphasisOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoSpaceInEmphasisOptions, MessageIds: NoSpaceInEmphasisMessageIds }>} NoSpaceInEmphasisRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const whitespacePattern = /[ \t]/u;

/**
 * Creates a marker pattern based on whether strikethrough should be included.
 * @param {boolean} checkStrikethrough Whether to include strikethrough markers.
 * @returns {RegExp} The marker pattern.
 */
function createMarkerPattern(checkStrikethrough) {
	return checkStrikethrough
		? /(?<=(?<!\\)(?:\\{2})*)(?:\*\*\*|\*\*|\*|___|__|_|~~|~)/gu
		: /(?<=(?<!\\)(?:\\{2})*)(?:\*\*\*|\*\*|\*|___|__|_)/gu;
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoSpaceInEmphasisRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow spaces around emphasis markers",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-space-in-emphasis.md",
		},

		fixable: "whitespace",

		messages: {
			spaceInEmphasis: "Unexpected space around emphasis marker.",
		},

		schema: [
			{
				type: "object",
				properties: {
					checkStrikethrough: {
						type: "boolean",
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{
				checkStrikethrough: false,
			},
		],
	},

	create(context) {
		const { sourceCode } = context;
		const [{ checkStrikethrough }] = context.options;
		const markerPattern = createMarkerPattern(checkStrikethrough);

		/** @type {string[]} */
		let buffer;

		/**
		 * Reports a surrounding-space violation if present.
		 * @param {number} checkIndex Character index to test for whitespace.
		 * @param {number} highlightStartIndex Start index for highlighting.
		 * @param {number} highlightEndIndex End index for highlighting.
		 * @returns {void}
		 */
		function reportWhitespace(
			checkIndex,
			highlightStartIndex,
			highlightEndIndex,
		) {
			if (whitespacePattern.test(sourceCode.text[checkIndex])) {
				context.report({
					loc: {
						start: sourceCode.getLocFromIndex(highlightStartIndex),
						end: sourceCode.getLocFromIndex(highlightEndIndex),
					},
					messageId: "spaceInEmphasis",
					fix(fixer) {
						return fixer.removeRange([checkIndex, checkIndex + 1]);
					},
				});
			}
		}

		return {
			"heading, paragraph, tableCell"(
				/** @type {Heading | Paragraph | TableCell} */ node,
			) {
				const [startOffset, endOffset] = sourceCode.getRange(node);

				// Initialize `buffer` with a whitespace-masked character array.
				buffer = new Array(endOffset - startOffset).fill(" ");
			},

			":matches(heading, paragraph, tableCell) > text"(
				/** @type {Text} */ node,
			) {
				const [startOffset, endOffset] = sourceCode.getRange(node);
				const parentNodeStartOffset = // Parent node can be `Heading`, `Paragraph`, or `TableCell`.
					sourceCode.getParent(node).position.start.offset;

				// Add the content of a `Text` node into the current buffer at the correct offsets.
				for (let i = startOffset; i < endOffset; i++) {
					buffer[i - parentNodeStartOffset] = sourceCode.text[i];
				}
			},

			":matches(heading, paragraph, tableCell):exit"(
				/** @type {Heading | Paragraph | TableCell} */ node,
			) {
				const maskedText = buffer.join("");
				/** @type {Map<string, SourceRange[]>} */
				const markerGroups = new Map();

				/** @type {RegExpExecArray | null} */
				let match;

				while ((match = markerPattern.exec(maskedText)) !== null) {
					const marker = match[0];
					const startOffset = // Adjust `markerPattern` match index to the full source code.
						match.index + node.position.start.offset;
					const endOffset = startOffset + marker.length;

					if (!markerGroups.has(marker)) {
						markerGroups.set(marker, []);
					}
					markerGroups.get(marker).push([startOffset, endOffset]);
				}

				for (const group of markerGroups.values()) {
					for (let i = 0; i < group.length - 1; i += 2) {
						const startMarker = group[i];
						reportWhitespace(
							startMarker[1],
							startMarker[0],
							startMarker[1] + 2,
						);

						const endMarker = group[i + 1];
						reportWhitespace(
							endMarker[0] - 1,
							endMarker[0] - 2,
							endMarker[1],
						);
					}
				}
			},
		};
	},
};
