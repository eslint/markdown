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
 * @import { Heading, Node, Paragraph, TableCell } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {{marker: string, startIndex: number, endIndex: number}} EmphasisMarker
 * @typedef {"spaceInEmphasis"} NoSpaceInEmphasisMessageIds
 * @typedef {[{ includeStrikethrough?: boolean }]} NoSpaceInEmphasisOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoSpaceInEmphasisOptions, MessageIds: NoSpaceInEmphasisMessageIds }>} NoSpaceInEmphasisRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const whitespacePattern = /[ \t]/u;

/**
 * Creates a marker pattern based on whether strikethrough should be included
 * @param {boolean} includeStrikethrough Whether to include strikethrough markers
 * @returns {RegExp} The marker pattern
 */
function createMarkerPattern(includeStrikethrough) {
	if (includeStrikethrough) {
		return /(?<!\\)(\*\*\*|\*\*|\*|___|__|_|~~|~)/gu;
	}
	return /(?<!\\)(\*\*\*|\*\*|\*|___|__|_)/gu;
}

/**
 * Creates emphasis types set based on whether strikethrough should be included
 * @param {boolean} includeStrikethrough Whether to include strikethrough types
 * @returns {Set<string>} The emphasis types set
 */
function createEmphasisTypes(includeStrikethrough) {
	const types = new Set(["emphasis", "strong"]);
	if (includeStrikethrough) {
		types.add("delete");
	}
	return types;
}

/**
 * Finds all emphasis markers in the text
 * @param {string} text The text to search
 * @param {RegExp} pattern The marker pattern to use
 * @returns {Array<EmphasisMarker>} Array of emphasis markers
 */
function findEmphasisMarkers(text, pattern) {
	/** @type {Array<EmphasisMarker>} */
	const markers = [];
	/** @type {RegExpExecArray | null} */
	let match;

	while ((match = pattern.exec(text)) !== null) {
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

		schema: [
			{
				type: "object",
				properties: {
					includeStrikethrough: {
						type: "boolean",
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{
				includeStrikethrough: false,
			},
		],
	},

	create(context) {
		const { sourceCode } = context;
		const [{ includeStrikethrough }] = context.options;
		const markerPattern = createMarkerPattern(includeStrikethrough);
		const emphasisTypes = createEmphasisTypes(includeStrikethrough);

		/**
		 * Extracts text from a node, replacing emphasis and HTML nodes with whitespace
		 * @param {Heading|Paragraph|TableCell} node The node to extract text from
		 * @returns {string} The extracted text with certain nodes replaced by whitespace
		 */
		function extractText(node) {
			let result = "";

			if (node.type === "heading" || node.type === "tableCell") {
				if (node.children.length > 0) {
					result += " ".repeat(
						node.children[0].position.start.offset -
							node.position.start.offset,
					);
				}
			}

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

		/**
		 * Checks a given node for emphasis markers with surrounding spaces and reports them.
		 * @param {Heading|Paragraph|TableCell} node The node to check for emphasis spacing issues.
		 * @returns {void}
		 */
		function checkEmphasis(node) {
			const originalText = sourceCode.getText(node);
			const filteredText = extractText(node);
			const markers = findEmphasisMarkers(filteredText, markerPattern);

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
						whitespacePattern.test(originalText[startSpacePosition])
					) {
						const {
							lineOffset: startLineOffset,
							columnOffset: startColumnOffset,
						} = findOffsets(originalText, startMarker.startIndex);
						const {
							lineOffset: endLineOffset,
							columnOffset: endColumnOffset,
						} = findOffsets(originalText, startMarker.endIndex + 2);

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
								const nodeStart = node.position.start.offset;
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
						whitespacePattern.test(originalText[endSpacePosition])
					) {
						const {
							lineOffset: startLineOffset,
							columnOffset: startColumnOffset,
						} = findOffsets(originalText, endMarker.startIndex - 2);
						const {
							lineOffset: endLineOffset,
							columnOffset: endColumnOffset,
						} = findOffsets(originalText, endMarker.endIndex);

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
								const nodeStart = node.position.start.offset;
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
		}

		return {
			heading: checkEmphasis,
			paragraph: checkEmphasis,
			tableCell: checkEmphasis,
		};
	},
};
