/**
 * @fileoverview Rule to prevent duplicate headings in Markdown.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { toString } from "mdast-util-to-string";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"duplicateHeading"} NoDuplicateHeadingsMessageIds
 * @typedef {[{ checkSiblingsOnly?: boolean }]} NoDuplicateHeadingsOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoDuplicateHeadingsOptions, MessageIds: NoDuplicateHeadingsMessageIds }>} NoDuplicateHeadingsRuleDefinition
 */

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

		/** @type {Map<number, Set<string>>} */
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
		let currentLevelHeadingSequence = "";

		return {
			heading(node) {
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
			},

			"heading *"(child) {
				currentLevelHeadingSequence += JSON.stringify({
					type: child.type,
					value: child.value,
				});
			},

			"heading:exit"(node) {
				if (currentLevelHeadings.has(currentLevelHeadingSequence)) {
					context.report({
						loc: node.position,
						messageId: "duplicateHeading",
						data: {
							text: toString(node),
						},
					});
				} else {
					// Add a copy of the sequence to prevent mutation issues.
					currentLevelHeadings.add(currentLevelHeadingSequence);
				}

				currentLevelHeadingSequence = "";
			},
		};
	},
};
