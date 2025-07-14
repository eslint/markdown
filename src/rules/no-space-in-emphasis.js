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
 * @import { Node, Paragraph } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {{marker: string, startIndex: number, endIndex: number}} EmphasisMarker
 * @typedef {"spaceInEmphasis"} NoSpaceInEmphasisMessageIds
 * @typedef {[]} NoSpaceInEmphasisOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoSpaceInEmphasisOptions, MessageIds: NoSpaceInEmphasisMessageIds }>} NoSpaceInEmphasisRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const markerPattern = /(?<!\\)(\*\*\*|\*\*|\*|___|__|_|~~|~)/gu;
const whitespacePattern = /[ \t]/u;
const emphasisTypes = new Set(["emphasis", "strong", "delete"]);

/**
 * Finds all emphasis markers in the text
 * @param {string} text The text to search
 * @returns {Array<EmphasisMarker>} Array of emphasis markers
 */
function findEmphasisMarkers(text) {
	/** @type {Array<EmphasisMarker>} */
	const markers = [];
	/** @type {RegExpExecArray | null} */
	let match;

	while ((match = markerPattern.exec(text)) !== null) {
		markers.push({
			marker: match[1],
			startIndex: match.index,
			endIndex: match.index + match[1].length,
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
	},

	create(context) {
		const { sourceCode } = context;

		/**
		 * Extracts text from a node, replacing emphasis and HTML nodes with whitespace
		 * @param {Paragraph} node The node to extract text from
		 * @returns {string} The extracted text with certain nodes replaced by whitespace
		 */
		function extractText(node) {
			let result = "";

			/**
			 * Traverses the AST and builds the filtered text
			 * @param {Node} currentNode The current AST node being traversed.
			 * @returns {void}
			 */
			function traverse(currentNode) {
				if (currentNode.type === "text") {
					result += sourceCode.getText(currentNode);
					return;
				}

				if (
					currentNode.type === "html" ||
					emphasisTypes.has(currentNode.type)
				) {
					result += " ".repeat(
						currentNode.position.end.offset -
							currentNode.position.start.offset,
					);
					return;
				}

				if (
					"children" in currentNode &&
					Array.isArray(currentNode.children)
				) {
					currentNode.children.forEach(traverse);
				}
			}

			traverse(node);
			return result;
		}

		return {
			paragraph(node) {
				const originalText = sourceCode.getText(node);
				const filteredText = extractText(node);
				const markers = findEmphasisMarkers(filteredText);

				const markerGroups = markers.reduce((groups, marker) => {
					if (!groups[marker.marker]) {
						groups[marker.marker] = [];
					}
					groups[marker.marker].push(marker);
					return groups;
				}, {});

				const nodeStartLine = node.position.start.line;
				const nodeStartColumn = node.position.start.column;

				for (const group of Object.values(markerGroups)) {
					for (let i = 0; i < group.length - 1; i += 2) {
						const startMarker = group[i];
						const startSpacePosition = startMarker.endIndex;
						if (
							whitespacePattern.test(
								originalText[startSpacePosition],
							)
						) {
							const {
								lineOffset: startLineOffset,
								columnOffset: startColumnOffset,
							} = findOffsets(
								originalText,
								startMarker.startIndex,
							);
							const {
								lineOffset: endLineOffset,
								columnOffset: endColumnOffset,
							} = findOffsets(
								originalText,
								startMarker.endIndex + 2,
							);

							context.report({
								loc: {
									start: {
										line: nodeStartLine + startLineOffset,
										column:
											nodeStartColumn + startColumnOffset,
									},
									end: {
										line: nodeStartLine + endLineOffset,
										column:
											nodeStartColumn + endColumnOffset,
									},
								},
								messageId: "spaceInEmphasis",
								fix(fixer) {
									const nodeStart =
										node.position.start.offset;
									const relativePosition =
										nodeStart + startSpacePosition;
									return fixer.removeRange([
										relativePosition,
										relativePosition + 1,
									]);
								},
							});
						}

						const endMarker = group[i + 1];
						const endSpacePosition = endMarker.startIndex - 1;
						if (
							whitespacePattern.test(
								originalText[endSpacePosition],
							)
						) {
							const {
								lineOffset: startLineOffset,
								columnOffset: startColumnOffset,
							} = findOffsets(
								originalText,
								endMarker.startIndex - 2,
							);
							const {
								lineOffset: endLineOffset,
								columnOffset: endColumnOffset,
							} = findOffsets(originalText, endMarker.endIndex);

							context.report({
								loc: {
									start: {
										line: nodeStartLine + startLineOffset,
										column:
											nodeStartColumn + startColumnOffset,
									},
									end: {
										line: nodeStartLine + endLineOffset,
										column:
											nodeStartColumn + endColumnOffset,
									},
								},
								messageId: "spaceInEmphasis",
								fix(fixer) {
									const nodeStart =
										node.position.start.offset;
									const relativePosition =
										nodeStart + endSpacePosition;
									return fixer.removeRange([
										relativePosition,
										relativePosition + 1,
									]);
								},
							});
						}
					}
				}
			},
		};
	},
};
