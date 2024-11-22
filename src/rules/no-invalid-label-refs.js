/**
 * @fileoverview Rule to prevent non-complaint link references.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { findOffsets, illegalShorthandTailPattern } from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/** @typedef {import("unist").Position} Position */
/** @typedef {import("mdast").Text} TextNode */
/** @typedef {import("eslint").Rule.RuleModule} RuleModule */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

// matches i.e., [foo][bar]
const labelPattern = /\]\[([^\]]+)\]/u;

/**
 * Finds missing references in a node.
 * @param {TextNode} node The node to check.
 * @param {string} docText The text of the node.
 * @returns {Array<{label:string,position:Position}>} The missing references.
 */
function findInvalidLabelReferences(node, docText) {
	const invalid = [];
	let startIndex = 0;
	const offset = node.position.start.offset;
	const nodeStartLine = node.position.start.line;
	const nodeStartColumn = node.position.start.column;

	/*
	 * This loop works by searching the string inside the node for the next
	 * label reference. If it finds one, it checks to see if there is any
	 * white space between the [ and ]. If there is, it reports an error.
	 * It then moves the start index to the end of the label reference and
	 * continues searching the text until the end of the text is found.
	 */
	while (startIndex < node.value.length) {
		const value = node.value.slice(startIndex);
		const match = value.match(labelPattern);

		if (!match) {
			break;
		}

		if (!illegalShorthandTailPattern.test(match[0])) {
			startIndex += match.index + match[0].length;
			continue;
		}

		/*
		 * Calculate the match index relative to just the node and
		 * to the entire document text.
		 */
		const nodeMatchIndex = startIndex + match.index;
		const docMatchIndex = offset + nodeMatchIndex;

		/*
		 * Search the entire document text to find the preceding open bracket.
		 */
		const lastOpenBracketIndex = docText.lastIndexOf("[", docMatchIndex);

		if (lastOpenBracketIndex === -1) {
			startIndex += match.index + match[0].length;
			continue;
		}

		/*
		 * Note: `label` can contain leading and trailing newlines, so we need to
		 * take that into account when calculating the line and column offsets.
		 */
		const label = docText
			.slice(lastOpenBracketIndex, docMatchIndex + match[0].length)
			.match(/!?\[([^\]]+)\]/u)[1];

		// find location of [ in the document text
		const { lineOffset: startLineOffset, columnOffset: startColumnOffset } =
			findOffsets(node.value, nodeMatchIndex + 1);

		// find location of [ in the document text
		const { lineOffset: endLineOffset, columnOffset: endColumnOffset } =
			findOffsets(node.value, nodeMatchIndex + match[0].length);

		const startLine = nodeStartLine + startLineOffset;
		const startColumn = nodeStartColumn + startColumnOffset;
		const endLine = nodeStartLine + endLineOffset;
		const endColumn =
			(endLine === startLine ? nodeStartColumn : 0) + endColumnOffset;

		invalid.push({
			label: label.trim(),
			position: {
				start: {
					line: startLine,
					column: startColumn,
				},
				end: {
					line: endLine,
					column: endColumn,
				},
			},
		});

		startIndex += match.index + match[0].length;
	}

	return invalid;
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {RuleModule} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow invalid label references",
		},

		messages: {
			invalidLabelRef:
				"Label reference '{{label}}' is invalid due to white space between [ and ].",
		},
	},

	create(context) {
		const { sourceCode } = context;

		return {
			text(node) {
				const invalidReferences = findInvalidLabelReferences(
					node,
					sourceCode.text,
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
};
