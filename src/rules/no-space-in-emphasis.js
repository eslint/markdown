/**
 * @fileoverview Rule to prevent spaces around emphasis markers in Markdown.
 * @author Pixel998
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { Heading, Paragraph, TableCell, Text } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"spaceInEmphasis"} NoSpaceInEmphasisMessageIds
 * @typedef {[{ checkStrikethrough?: boolean }]} NoSpaceInEmphasisOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoSpaceInEmphasisOptions, MessageIds: NoSpaceInEmphasisMessageIds }>} NoSpaceInEmphasisRuleDefinition
 * @typedef {{startIndex: number, endIndex: number}} EmphasisMarker
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
		? /(?<=(?<!\\)(?:\\{2})*)(?<marker>\*\*\*|\*\*|\*|___|__|_|~~|~)/gu
		: /(?<=(?<!\\)(?:\\{2})*)(?<marker>\*\*\*|\*\*|\*|___|__|_)/gu;
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

		/** @type {{ buffer: string[], startOffset: number } | null} */
		let bufferState = null;

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
			// Initialize `bufferState` with a whitespace-masked character buffer for the node.
			"heading, paragraph, tableCell"(
				/** @type {Heading | Paragraph | TableCell} */ node,
			) {
				const [startOffset, endOffset] = sourceCode.getRange(node);
				bufferState = {
					buffer: new Array(endOffset - startOffset).fill(" "),
					startOffset,
				};
			},

			// Add the content of a `Text` node into the current buffer at the correct offsets.
			":matches(heading, paragraph, tableCell) > text"(
				/** @type {Text} */ node,
			) {
				const start =
					node.position.start.offset - bufferState.startOffset;
				const text = sourceCode.getText(node);
				for (let i = 0; i < text.length; i++) {
					bufferState.buffer[start + i] = text[i];
				}
			},

			// Join the character buffer into a masked string, run checks, then clear state.
			":matches(heading, paragraph, tableCell):exit"(
				/** @type {Heading | Paragraph | TableCell} */ node,
			) {
				const maskedText = bufferState.buffer.join("");
				/** @type {Map<string, EmphasisMarker[]>} */
				const markerGroups = new Map();

				/** @type {RegExpExecArray | null} */
				let match;

				while ((match = markerPattern.exec(maskedText)) !== null) {
					const marker = match.groups.marker;
					const startIndex = match.index + node.position.start.offset;
					const endIndex = startIndex + match.groups.marker.length;

					if (!markerGroups.has(marker)) {
						markerGroups.set(marker, []);
					}
					markerGroups.get(marker).push({ startIndex, endIndex });
				}

				for (const group of markerGroups.values()) {
					for (let i = 0; i < group.length - 1; i += 2) {
						const startMarker = group[i];
						reportWhitespace(
							startMarker.endIndex,
							startMarker.startIndex,
							startMarker.endIndex + 2,
						);

						const endMarker = group[i + 1];
						reportWhitespace(
							endMarker.startIndex - 1,
							endMarker.startIndex - 2,
							endMarker.endIndex,
						);
					}
				}

				bufferState = null;
			},
		};
	},
};
