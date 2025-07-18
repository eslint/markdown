/**
 * @fileoverview Rule to prevent duplicate headings in Markdown.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import equal from "fast-deep-equal";
import { toString } from "mdast-util-to-string";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { Node } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"duplicateHeading"} NoDuplicateHeadingsMessageIds
 * @typedef {[{ checkSiblingsOnly?: boolean }]} NoDuplicateHeadingsOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoDuplicateHeadingsOptions, MessageIds: NoDuplicateHeadingsMessageIds }>} NoDuplicateHeadingsRuleDefinition
 * @typedef {Omit<Node, 'position' | 'data'>} NodeWithoutPositionAndData
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Removes `position` and `data` properties from a node, recursively for all children.
 * @param {Node} node The node to process.
 * @returns {NodeWithoutPositionAndData} A new node without `position` and `data` properties.
 */
function removePositionAndDataFromNode(node) {
	// eslint-disable-next-line no-unused-vars -- Needed to remove `position` and `data` properties.
	const { position, data, ...nodeWithoutPositionAndData } = node;

	if (
		"children" in nodeWithoutPositionAndData &&
		Array.isArray(nodeWithoutPositionAndData.children)
	) {
		nodeWithoutPositionAndData.children =
			nodeWithoutPositionAndData.children.map(
				removePositionAndDataFromNode,
			);
	}

	return nodeWithoutPositionAndData;
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoDuplicateHeadingsRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow duplicate headings in the same document",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-duplicate-headings.md",
		},

		messages: {
			duplicateHeading: 'Duplicate heading "{{text}}" found.',
		},

		schema: [
			{
				type: "object",
				properties: {
					checkSiblingsOnly: {
						type: "boolean",
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [{ checkSiblingsOnly: false }],
	},

	create(context) {
		const [{ checkSiblingsOnly }] = context.options;

		/** @type {Map<number, Set<NodeWithoutPositionAndData[]>>} */
		const headingsByLevel = checkSiblingsOnly
			? new Map([
					[1, new Set()],
					[2, new Set()],
					[3, new Set()],
					[4, new Set()],
					[5, new Set()],
					[6, new Set()],
				])
			: new Map([[1, new Set()]]);
		let lastLevel = 1;
		let currentLevelHeadings = headingsByLevel.get(lastLevel);

		return {
			heading(node) {
				const headingChildren = node.children.map(
					removePositionAndDataFromNode,
				);

				if (checkSiblingsOnly) {
					const currentLevel = node.depth;

					if (currentLevel < lastLevel) {
						for (
							let level = lastLevel;
							level > currentLevel;
							level--
						) {
							headingsByLevel.get(level).clear();
						}
					}

					lastLevel = currentLevel;
					currentLevelHeadings = headingsByLevel.get(currentLevel);
				}

				if (
					[...currentLevelHeadings].some(item =>
						equal(item, headingChildren),
					)
				) {
					context.report({
						loc: node.position,
						messageId: "duplicateHeading",
						data: {
							text: toString(node),
						},
					});
				} else {
					currentLevelHeadings.add(headingChildren);
				}
			},
		};
	},
};
