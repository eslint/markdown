/**
 * @fileoverview Rule to prevent non-complaint link references.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { illegalShorthandTailPattern } from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { Position } from "unist";
 * @import { Text } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @import { MarkdownSourceCode } from "../language/markdown-source-code.js";
 * @typedef {"invalidLabelRef"} NoInvalidLabelRefsMessageIds
 * @typedef {[]} NoInvalidLabelRefsOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoInvalidLabelRefsOptions, MessageIds: NoInvalidLabelRefsMessageIds }>} NoInvalidLabelRefsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/** Matches a reference tail whose first closing bracket is not escaped. */
const labelPattern = /\](?<=(?<!\\)(?:\\{2})*\])\[([^\]]+)\]/gu;

/**
 * Checks whether a character is escaped by consecutive backslashes.
 * @param {string} text The document text.
 * @param {number} index The character offset.
 * @returns {boolean} Whether the character is escaped.
 */
function isEscaped(text, index) {
	let count = 0;

	for (let i = index - 1; i >= 0 && text[i] === "\\"; i--) {
		count++;
	}

	return count % 2 === 1;
}

/**
 * Finds the opening bracket paired with a closing bracket.
 * @param {string} text The document text.
 * @param {number} closeIndex The closing bracket offset.
 * @param {number} lowerBound The containing inline block's start offset.
 * @returns {number} The opening bracket offset, or -1 if none exists.
 */
function findOpeningBracket(text, closeIndex, lowerBound) {
	let depth = 1;

	for (let i = closeIndex - 1; i >= lowerBound; i--) {
		const character = text[i];

		if (character !== "[" && character !== "]") {
			continue;
		}

		if (isEscaped(text, i)) {
			continue;
		}

		if (character === "]") {
			depth++;
		} else {
			depth--;
			if (depth === 0) {
				return i;
			}
		}
	}
	return -1;
}

/**
 * Finds invalid label references in a node.
 * @param {Text} node The node to check.
 * @param {MarkdownSourceCode} sourceCode The Markdown source code object.
 * @param {number} lowerBound The containing inline block's start offset.
 * @returns {Array<{label:string,position:Position}>} The invalid references.
 */
function findInvalidLabelReferences(node, sourceCode, lowerBound) {
	const nodeText = sourceCode.getText(node);
	const docText = sourceCode.text;
	const invalid = [];

	for (const match of nodeText.matchAll(labelPattern)) {
		if (!illegalShorthandTailPattern.test(match[0])) {
			continue;
		}

		const startOffset = match.index + node.position.start.offset;
		const endOffset = startOffset + match[0].length;

		const openBracketIndex = findOpeningBracket(
			docText,
			startOffset,
			lowerBound,
		);

		if (openBracketIndex === -1) {
			continue;
		}
		const label = docText.slice(openBracketIndex + 1, startOffset);

		invalid.push({
			label: label.trim(),
			position: {
				start: sourceCode.getLocFromIndex(startOffset + 1),
				end: sourceCode.getLocFromIndex(endOffset),
			},
		});
	}

	return invalid;
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default /** @satisfies {NoInvalidLabelRefsRuleDefinition} */ ({
	meta: {
		type: "problem",
		languages: ["markdown/commonmark", "markdown/gfm"],

		docs: {
			recommended: true,
			description: "Disallow invalid label references",
			dialects: ["CommonMark", "GFM"],
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-invalid-label-refs.md",
		},

		messages: {
			invalidLabelRef:
				"Label reference '{{label}}' is invalid due to white space between [ and ].",
		},
	},

	create(context) {
		const { sourceCode } = context;
		/** @type {number[]} */
		const blockStarts = [];

		return {
			":matches(heading, paragraph, tableCell)"(node) {
				blockStarts.push(node.position.start.offset);
			},

			":matches(heading, paragraph, tableCell):exit"() {
				blockStarts.pop();
			},

			text(node) {
				const invalidReferences = findInvalidLabelReferences(
					node,
					sourceCode,
					blockStarts.at(-1) ?? node.position.start.offset,
				);

				for (const invalidReference of invalidReferences) {
					context.report({
						loc: invalidReference.position,
						messageId: "invalidLabelRef",
						data: {
							label: invalidReference.label,
						},
					});
				}
			},
		};
	},
});
