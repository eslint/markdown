/**
 * @fileoverview Rule to prevent duplicate headings in Markdown.
 * @author Nicholas C. Zakas
 */

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
		/** @type {string} */
		let headingChildrenSequence;
		/** @type {string} */
		let headingText;

		return {
			heading(node) {
				headingChildrenSequence = "";
				headingText = "";

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

			"heading *"({ type, value }) {
				if (value) {
					headingChildrenSequence += `[${type},${value}]`; // We use a custom sequence representation to keep track of heading children.

					if (type !== "html") {
						headingText += value;
					}
				} else {
					headingChildrenSequence += `[${type}]`;
				}
			},

			"heading:exit"(node) {
				if (currentLevelHeadings.has(headingChildrenSequence)) {
					context.report({
						loc: node.position,
						messageId: "duplicateHeading",
						data: {
							text: headingText,
						},
					});
				} else {
					currentLevelHeadings.add(headingChildrenSequence);
				}
			},
		};
	},
};
