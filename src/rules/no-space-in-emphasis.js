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
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: []; }>}
 * NoSpaceInEmphasisRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const markerPattern = /(?<!\\)(\*\*\*|\*\*|\*|___|__|_|~~|~)/gu;
const whitespacePattern = /\s/u;

/**
 * Finds all emphasis markers in the text
 * @param {string} text The text to search
 * @returns {Array<{marker: string, start: number, end: number}>} Array of emphasis markers
 */
function findEmphasisMarkers(text) {
	const markers = [];
	let match;

	while ((match = markerPattern.exec(text)) !== null) {
		const marker = match[1];
		const start = match.index;
		const end = start + marker.length;

		markers.push({ marker, start, end });
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
	},

	create(context) {
		const { sourceCode } = context;

		return {
			text(node) {
				const text = sourceCode.getText(node);
				const markers = findEmphasisMarkers(text);

				for (let i = 0; i < markers.length - 1; i += 2) {
					const startMarker = markers[i];
					const endMarker = markers[i + 1];

					if (startMarker.marker !== endMarker.marker) {
						continue;
					}

					const hasStartSpace = whitespacePattern.test(
						text[startMarker.end],
					);
					const hasEndSpace = whitespacePattern.test(
						text[endMarker.start - 1],
					);

					if (hasStartSpace || hasEndSpace) {
						const {
							lineOffset: startLineOffset,
							columnOffset: startColumnOffset,
						} = findOffsets(text, startMarker.start);
						const {
							lineOffset: endLineOffset,
							columnOffset: endColumnOffset,
						} = findOffsets(text, endMarker.end);

						const startLine =
							node.position.start.line + startLineOffset;
						const endLine =
							node.position.start.line + endLineOffset;
						const startColumn =
							node.position.start.column + startColumnOffset;
						const endColumn =
							node.position.start.column + endColumnOffset;

						context.report({
							loc: {
								start: { line: startLine, column: startColumn },
								end: { line: endLine, column: endColumn },
							},
							messageId: "spaceInEmphasis",
							fix(fixer) {
								const betweenText = text.slice(
									startMarker.end,
									endMarker.start,
								);

								const fixedText =
									startMarker.marker +
									betweenText.trim() +
									endMarker.marker;

								const nodeStart = node.position.start.offset;
								const relativeStart =
									nodeStart + startMarker.start;
								const relativeEnd = nodeStart + endMarker.end;

								return fixer.replaceTextRange(
									[relativeStart, relativeEnd],
									fixedText,
								);
							},
						});
					}
				}
			},
		};
	},
};
