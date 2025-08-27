/**
 * @fileoverview Rule to prevent missing label references in Markdown.
 * @author Nicholas C. Zakas
 */

// Placeholder

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { findOffsets, illegalShorthandTailPattern } from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { Position } from "unist";
 * @import { Text } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"notFound"} NoMissingLabelRefsMessageIds
 * @typedef {[]} NoMissingLabelRefsOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoMissingLabelRefsOptions, MessageIds: NoMissingLabelRefsMessageIds }>} NoMissingLabelRefsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Finds missing references in a node.
 * @param {Text} node The node to check.
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
	const labelPattern =
		/(?<!\\)\[(?<left>(?:\\.|[^[\]])*)(?<!\\)\](?:\[(?<right>(?:\\.|[^\]])*)(?<!\\)\])?/dgu;

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

/** @type {NoMissingLabelRefsRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow missing label references",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-missing-label-refs.md",
		},

		messages: {
			notFound: "Label reference '{{label}}' not found.",
		},
	},

	create(context) {
		const { sourceCode } = context;

		/** @type {Array<{label:string,position:Position}>} */
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
