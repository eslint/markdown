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
 * @import { SourceRange } from "@eslint/core"
 * @import { Heading, Paragraph, TableCell } from "mdast";
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
	/(?<!(?<!\\)\\)(?<imageBang>!)?\[(?<label>(?:\\.|[^()\\]|\([\s\S]*\))*?)\]\((?<destination>[ \t]*(?:\r\n?|\n)?(?<![ \t])[ \t]*(?:<[^>]*>|[^ \t()]+))(?:[ \t]*(?:\r\n?|\n)?(?<![ \t])[ \t]*(?<title>"[^"]*"|'[^']*'|\([^)]*\)))?[ \t]*(?:\r\n?|\n)?(?<![ \t])[ \t]*\)(?!\()/gu;

/**
 * Checks if a given index is within any skip range.
 * @param {number} index The index to check
 * @param {Array<SourceRange>} skipRanges The skip ranges
 * @returns {boolean} True if index is in a skip range
 */
function isInSkipRange(index, skipRanges) {
	return skipRanges.some(range => range[0] <= index && index < range[1]);
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
		/** @type {Array<SourceRange>} */
		const skipRanges = [];
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

			"heading :matches(html, inlineCode)"(node) {
				skipRanges.push(sourceCode.getRange(node));
			},

			paragraph(node) {
				relevantNodes.push(node);
			},

			"paragraph :matches(html, inlineCode)"(node) {
				skipRanges.push(sourceCode.getRange(node));
			},

			tableCell(node) {
				relevantNodes.push(node);
			},

			"tableCell :matches(html, inlineCode)"(node) {
				skipRanges.push(sourceCode.getRange(node));
			},

			"root:exit"() {
				for (const node of relevantNodes) {
					const text = sourceCode.getText(node);

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
