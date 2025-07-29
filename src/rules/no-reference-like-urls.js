/**
 * @fileoverview Rule to enforce reference-style links when URL matches a defined identifier.
 * @author TKDev7
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { normalizeIdentifier } from "micromark-util-normalize-identifier";
import { findOffsets } from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { Heading, Node, Paragraph, TableCell } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"referenceLikeUrl"} NoReferenceLikeUrlMessageIds
 * @typedef {[]} NoReferenceLikeUrlOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoReferenceLikeUrlOptions, MessageIds: NoReferenceLikeUrlMessageIds }>} NoReferenceLikeUrlRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/** Pattern to match both inline links: `[text](url)` and images: `![alt](url)`, with optional title */
const linkOrImagePattern =
	/(?<!(?<!\\)\\)(?<imageBang>!)?\[(?<label>(?:\\.|[^()\\]|\([\s\S]*\))*?)\]\((?<destination>(?:<[^>]*>)|(?:[^ \t)]+))(?:[ \t]+(?<title>"[^"]*"|'[^']*'|\([^)]*\)))?\)(?!\()/gu;

/**
 * Checks if a given index is within any skip range.
 * @param {number} index The index to check
 * @param {Array<{startOffset: number, endOffset: number}>} skipRanges The skip ranges
 * @returns {boolean} True if index is in a skip range
 */
function isInSkipRange(index, skipRanges) {
	return skipRanges.some(
		range => range.startOffset <= index && index < range.endOffset,
	);
}

/**
 * Finds ranges of inline code and HTML nodes within a given node
 * @param {Heading | Paragraph | TableCell} node The node to search
 * @returns {Array<{startOffset: number, endOffset: number}>} Array of skip ranges
 */
function findSkipRanges(node) {
	/** @type {Array<{startOffset: number, endOffset: number}>} */
	const skipRanges = [];

	/**
	 * Recursively traverses the AST to find inline code and HTML nodes.
	 * @param {Node} currentNode The current node being traversed
	 * @returns {void}
	 */
	function traverse(currentNode) {
		if (currentNode.type === "inlineCode" || currentNode.type === "html") {
			skipRanges.push({
				startOffset: currentNode.position.start.offset,
				endOffset: currentNode.position.end.offset,
			});
			return;
		}

		if ("children" in currentNode && Array.isArray(currentNode.children)) {
			currentNode.children.forEach(traverse);
		}
	}

	traverse(node);
	return skipRanges;
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoReferenceLikeUrlRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description:
				"Disallow URLs that match defined reference identifiers",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-reference-like-urls.md",
		},

		fixable: "code",

		messages: {
			referenceLikeUrl:
				"Unexpected resource {{type}} ('{{prefix}}[text](url)') with URL that matches a definition identifier. Use '[text][id]' syntax instead.",
		},
	},

	create(context) {
		const { sourceCode } = context;
		/** @type {Set<string>} */
		const definitionIdentifiers = new Set();
		/** @type {Array<Heading | Paragraph | TableCell>} */
		const relevantNodes = [];

		return {
			definition(node) {
				definitionIdentifiers.add(node.identifier);
			},

			heading(node) {
				relevantNodes.push(node);
			},

			paragraph(node) {
				relevantNodes.push(node);
			},

			tableCell(node) {
				relevantNodes.push(node);
			},

			"root:exit"() {
				for (const node of relevantNodes) {
					const text = sourceCode.getText(node);
					const skipRanges = findSkipRanges(node);

					let match;
					while ((match = linkOrImagePattern.exec(text)) !== null) {
						const {
							imageBang,
							label,
							destination,
							title: titleRaw,
						} = match.groups;
						const title = titleRaw?.slice(1, -1);
						const matchIndex = match.index;
						const matchLength = match[0].length;

						if (
							isInSkipRange(
								matchIndex + node.position.start.offset,
								skipRanges,
							)
						) {
							continue;
						}

						const isImage = !!imageBang;
						const type = isImage ? "image" : "link";
						const prefix = isImage ? "!" : "";
						const url =
							normalizeIdentifier(destination).toLowerCase();

						if (definitionIdentifiers.has(url)) {
							const {
								lineOffset: startLineOffset,
								columnOffset: startColumnOffset,
							} = findOffsets(text, matchIndex);
							const {
								lineOffset: endLineOffset,
								columnOffset: endColumnOffset,
							} = findOffsets(text, matchIndex + matchLength);

							const baseColumn = 1;
							const nodeStartLine = node.position.start.line;
							const nodeStartColumn = node.position.start.column;
							const startLine = nodeStartLine + startLineOffset;
							const endLine = nodeStartLine + endLineOffset;
							const startColumn =
								(startLine === nodeStartLine
									? nodeStartColumn
									: baseColumn) + startColumnOffset;
							const endColumn =
								(endLine === nodeStartLine
									? nodeStartColumn
									: baseColumn) + endColumnOffset;

							context.report({
								loc: {
									start: {
										line: startLine,
										column: startColumn,
									},
									end: { line: endLine, column: endColumn },
								},
								messageId: "referenceLikeUrl",
								data: {
									type,
									prefix,
								},
								fix(fixer) {
									// The AST treats both missing and empty titles as null, so it's safe to auto-fix in both cases.
									if (title) {
										return null;
									}

									const startOffset =
										node.position.start.offset + matchIndex;
									const endOffset = startOffset + matchLength;

									return fixer.replaceTextRange(
										[startOffset, endOffset],
										`${prefix}[${label}][${destination}]`,
									);
								},
							});
						}
					}
				}
			},
		};
	},
};
