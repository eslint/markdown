/**
 * @fileoverview Rule to prevent missing label references in Markdown.
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

/**
 * Finds missing references in a node.
 * @param {TextNode} node The node to check.
 * @param {string} nodeText The text of the node.
 * @returns {Array<{label:string,position:Position}>} The missing references.
 */
function findMissingReferences(node, nodeText) {
	const missing = [];
	const nodeStartLine = node.position.start.line;
	const nodeStartColumn = node.position.start.column;

	/*
	 * Matches substrings like "[foo]", "[]", "[foo][bar]", "[foo][]", "[][bar]", or "[][]".
	 * `left` is the content between the first brackets. It can be empty.
	 * `right` is the content between the second brackets. It can be empty, and it can be undefined.
	 */
	const labelPattern = /\[(?<left>[^\]]*)\](?:\[(?<right>[^\]]*)\])?/dgu;

	let match;

	/*
	 * This loop searches the text inside the node for sequences that
	 * look like label references and reports an error for each one found.
	 */
	while ((match = labelPattern.exec(nodeText))) {
		// skip illegal shorthand tail -- handled by no-invalid-label-refs
		if (illegalShorthandTailPattern.test(match[0])) {
			continue;
		}

		const { left, right } = match.groups;

		// `[][]` or `[]`
		if (!left && !right) {
			continue;
		}

		let label, labelIndices;

		if (right) {
			label = right;
			labelIndices = match.indices.groups.right;
		} else {
			label = left;
			labelIndices = match.indices.groups.left;
		}

		const { lineOffset: startLineOffset, columnOffset: startColumnOffset } =
			findOffsets(nodeText, labelIndices[0]);
		const { lineOffset: endLineOffset, columnOffset: endColumnOffset } =
			findOffsets(nodeText, labelIndices[1]);

		missing.push({
			label: label.trim(),
			position: {
				start: {
					line: nodeStartLine + startLineOffset,
					column:
						startLineOffset > 0
							? startColumnOffset + 1
							: nodeStartColumn + startColumnOffset,
				},
				end: {
					line: nodeStartLine + endLineOffset,
					column:
						endLineOffset > 0
							? endColumnOffset + 1
							: nodeStartColumn + endColumnOffset,
				},
			},
		});
	}

	return missing;
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
			description: "Disallow missing label references",
		},

		messages: {
			notFound: "Label reference '{{label}}' not found.",
		},
	},

	create(context) {
		const { sourceCode } = context;
		let allMissingReferences = [];

		return {
			"root:exit"() {
				for (const missingReference of allMissingReferences) {
					context.report({
						loc: missingReference.position,
						messageId: "notFound",
						data: {
							label: missingReference.label,
						},
					});
				}
			},

			text(node) {
				allMissingReferences.push(
					...findMissingReferences(node, sourceCode.getText(node)),
				);
			},

			definition(node) {
				/*
				 * Sometimes a poorly-formatted link will end up a text node instead of a link node
				 * even though the label definition exists. Here, we remove any missing references
				 * that have a matching label definition.
				 */
				allMissingReferences = allMissingReferences.filter(
					missingReference =>
						missingReference.label !== node.identifier,
				);
			},
		};
	},
};
