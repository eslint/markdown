/**
 * @fileoverview Rule to prevent spaces around emphasis markers in Markdown.
 * @author Pixel998
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { findOffsets } from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
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
		? /(?<=(?<!\\)(?:\\{2})*)(?<marker>\*\*\*|\*\*|\*|___|__|_|~~|~)/gu
		: /(?<=(?<!\\)(?:\\{2})*)(?<marker>\*\*\*|\*\*|\*|___|__|_)/gu;
}

/**
 * Finds all emphasis markers in the text.
 * @param {string} text The text to search.
 * @param {RegExp} pattern The marker pattern to use.
 * @typedef {{marker: string, startIndex: number, endIndex: number}} EmphasisMarker
 * @returns {Array<EmphasisMarker>} Array of emphasis markers.
 */
function findEmphasisMarkers(text, pattern) {
	/** @type {Array<EmphasisMarker>} */
	const markers = [];
	/** @type {RegExpExecArray | null} */
	let match;

	while ((match = pattern.exec(text)) !== null) {
		markers.push({
			marker: match.groups.marker,
			startIndex: match.index,
			endIndex: match.index + match.groups.marker.length,
		});
	}

	return markers;
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

		/**
		 * Reports a surrounding-space violation if present.
		 * @param {Object} params Options for the report arguments.
		 * @param {string} params.originalText The original text of the node.
		 * @param {number} params.checkIndex Character index to test for whitespace.
		 * @param {number} params.highlightStartIndex Start index for highlighting.
		 * @param {number} params.highlightEndIndex End index for highlighting.
		 * @param {number} params.removeIndex Absolute index of the space to remove.
		 * @param {number} params.nodeStartLine The starting line number for the node.
		 * @param {number} params.nodeStartColumn The starting column number for the node.
		 * @returns {void}
		 */
		function reportWhitespace({
			originalText,
			checkIndex,
			highlightStartIndex,
			highlightEndIndex,
			removeIndex,
			nodeStartLine,
			nodeStartColumn,
		}) {
			if (whitespacePattern.test(originalText[checkIndex])) {
				const {
					lineOffset: startLineOffset,
					columnOffset: startColumnOffset,
				} = findOffsets(originalText, highlightStartIndex);
				const {
					lineOffset: endLineOffset,
					columnOffset: endColumnOffset,
				} = findOffsets(originalText, highlightEndIndex);

				context.report({
					loc: {
						start: {
							line: nodeStartLine + startLineOffset,
							column: nodeStartColumn + startColumnOffset,
						},
						end: {
							line: nodeStartLine + endLineOffset,
							column: nodeStartColumn + endColumnOffset,
						},
					},
					messageId: "spaceInEmphasis",
					fix(fixer) {
						return fixer.removeRange([
							removeIndex,
							removeIndex + 1,
						]);
					},
				});
			}
		}

		/**
		 * Checks a given node for emphasis markers with surrounding spaces.
		 * @param {Heading|Paragraph|TableCell} node The node to check.
		 * @param {string} maskedText The masked text preserving only direct text content.
		 * @returns {void}
		 */
		function checkEmphasis(node, maskedText) {
			const originalText = sourceCode.getText(node);
			const markers = findEmphasisMarkers(maskedText, markerPattern);
			const nodeStartLine = node.position.start.line;
			const nodeStartColumn = node.position.start.column;
			const nodeStartOffset = node.position.start.offset;

			const markerGroups = new Map();
			for (const marker of markers) {
				if (!markerGroups.has(marker.marker)) {
					markerGroups.set(marker.marker, []);
				}
				markerGroups.get(marker.marker).push(marker);
			}

			for (const group of markerGroups.values()) {
				for (let i = 0; i < group.length - 1; i += 2) {
					const startMarker = group[i];
					reportWhitespace({
						originalText,
						checkIndex: startMarker.endIndex,
						highlightStartIndex: startMarker.startIndex,
						highlightEndIndex: startMarker.endIndex + 2,
						removeIndex: nodeStartOffset + startMarker.endIndex,
						nodeStartLine,
						nodeStartColumn,
					});

					const endMarker = group[i + 1];
					reportWhitespace({
						originalText,
						checkIndex: endMarker.startIndex - 1,
						highlightStartIndex: endMarker.startIndex - 2,
						highlightEndIndex: endMarker.endIndex,
						removeIndex: nodeStartOffset + endMarker.startIndex - 1,
						nodeStartLine,
						nodeStartColumn,
					});
				}
			}
		}

		/**
		 * Manager for building a masked character array for a node's direct text content.
		 * @typedef {{ buffer: string[], startOffset: number }} BufferState
		 */
		const bufferManager = {
			/** @type {BufferState | null} */
			state: null,

			/**
			 * Initialize state with a whitespace-masked character buffer for the node.
			 * @param {Heading|Paragraph|TableCell} node Heading, Paragraph, or TableCell node to enter.
			 * @returns {void}
			 */
			enter(node) {
				const [startOffset, endOffset] = sourceCode.getRange(node);
				this.state = {
					buffer: new Array(endOffset - startOffset).fill(" "),
					startOffset,
				};
			},

			/**
			 * Add the content of a Text node into the current buffer at the correct offsets.
			 * @param {Text} node Text node whose characters will be copied into the buffer.
			 * @returns {void}
			 */
			addText(node) {
				const start =
					node.position.start.offset - this.state.startOffset;
				const text = sourceCode.getText(node);
				for (let i = 0; i < text.length; i++) {
					this.state.buffer[start + i] = text[i];
				}
			},

			/**
			 * Join the character buffer into a masked string, run checks, then clear state.
			 * @param {Heading|Paragraph|TableCell} node Heading, Paragraph, or TableCell node to exit.
			 * @returns {void}
			 */
			exit(node) {
				checkEmphasis(node, this.state.buffer.join(""));
				this.state = null;
			},
		};

		return {
			heading(node) {
				bufferManager.enter(node);
			},
			"heading > text"(node) {
				bufferManager.addText(node);
			},
			"heading:exit"(node) {
				bufferManager.exit(node);
			},

			paragraph(node) {
				bufferManager.enter(node);
			},
			"paragraph > text"(node) {
				bufferManager.addText(node);
			},
			"paragraph:exit"(node) {
				bufferManager.exit(node);
			},

			tableCell(node) {
				bufferManager.enter(node);
			},
			"tableCell > text"(node) {
				bufferManager.addText(node);
			},
			"tableCell:exit"(node) {
				bufferManager.exit(node);
			},
		};
	},
};
