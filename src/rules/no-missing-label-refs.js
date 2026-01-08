/**
 * @fileoverview Rule to prevent missing label references in Markdown.
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
 * @typedef {"notFound"} NoMissingLabelRefsMessageIds
 * @typedef {[{ allowLabels?: string[] }]} NoMissingLabelRefsOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoMissingLabelRefsOptions, MessageIds: NoMissingLabelRefsMessageIds }>} NoMissingLabelRefsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Finds missing references in a node.
 * @param {Text} node The node to check.
 * @param {MarkdownSourceCode} sourceCode The Markdown source code object.
 * @returns {Array<{label:string,position:Position}>} The missing references.
 */
function findMissingReferences(node, sourceCode) {
	/** @type {Array<{label:string,position:Position}>} */
	const missing = [];
	const nodeText = sourceCode.getText(node);

	/**
	 * Matches substrings like `"[foo]"`, `"[]"`, `"[foo][bar]"`, `"[foo][]"`, `"[][bar]"`, or `"[][]"`.
	 * `left` is the content between the first brackets. It can be empty.
	 * `right` is the content between the second brackets. It can be empty, and it can be undefined.
	 */
	const labelPattern =
		/(?<=(?<!\\)(?:\\{2})*)\[(?<left>(?:\\.|[^[\]\\])*)\](?:\[(?<right>(?:\\.|[^\]\\])*)\])?/dgu;

	/** @type {RegExpExecArray | null} */
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

		const startOffset = labelIndices[0] + node.position.start.offset;
		const endOffset = labelIndices[1] + node.position.start.offset;

		missing.push({
			label: label.trim(),
			position: {
				start: sourceCode.getLocFromIndex(startOffset),
				end: sourceCode.getLocFromIndex(endOffset),
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

		schema: [
			{
				type: "object",
				properties: {
					allowLabels: {
						type: "array",
						items: {
							type: "string",
						},
						uniqueItems: true,
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{
				allowLabels: [],
			},
		],

		messages: {
			notFound: "Label reference '{{label}}' not found.",
		},
	},

	create(context) {
		const { sourceCode } = context;
		const allowLabels = new Set(context.options[0].allowLabels);

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
				const missingReferences = findMissingReferences(
					node,
					sourceCode,
				);

				for (const missingReference of missingReferences) {
					if (!allowLabels.has(missingReference.label)) {
						allMissingReferences.push(missingReference);
					}
				}
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
