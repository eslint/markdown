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

/** Matches unescaped brackets and optional reference tails. */
const bracketPattern =
	/\[(?<=(?<!\\)(?:\\{2})*\[)|\](?<=(?<!\\)(?:\\{2})*\])(?:\[[^\]]+\])?/gu;

/**
 * Finds invalid label references in a node.
 * @param {Text} node The node to check.
 * @param {MarkdownSourceCode} sourceCode The Markdown source code object.
 * @param {number[]} openingBrackets The opening bracket offsets in the current scope.
 * @returns {Array<{label:string,position:Position}>} The invalid references.
 */
function findInvalidLabelReferences(node, sourceCode, openingBrackets) {
	const nodeText = sourceCode.getText(node);
	const docText = sourceCode.text;
	const invalid = [];

	for (const match of nodeText.matchAll(bracketPattern)) {
		const startOffset = node.position.start.offset + match.index;

		if (match[0][0] === "[") {
			openingBrackets.push(startOffset);
			continue;
		}

		const openBracketIndex = openingBrackets.pop();

		if (
			openBracketIndex === undefined ||
			!illegalShorthandTailPattern.test(match[0])
		) {
			continue;
		}

		const endOffset = startOffset + match[0].length;
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

		/** @type {number[][]} */
		const openingBracketStack = [];

		return {
			":matches(heading, paragraph, tableCell, link, linkReference)"() {
				openingBracketStack.push([]);
			},

			":matches(heading, paragraph, tableCell, link, linkReference):exit"() {
				openingBracketStack.pop();
			},

			text(node) {
				const invalidReferences = findInvalidLabelReferences(
					node,
					sourceCode,
					openingBracketStack.at(-1) ?? [],
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
