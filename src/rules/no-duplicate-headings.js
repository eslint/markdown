/**
 * @fileoverview Rule to prevent duplicate headings in Markdown.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/** @typedef {import("mdast").Heading} HeadingNode */
/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: [{ checkSiblingsOnly?: boolean; }]; }>}
 * NoDuplicateHeadingsRuleDefinition
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
		const { sourceCode } = context;

		const headingsByLevel = checkSiblingsOnly
			? new Array(7).fill(null).map(() => new Set())
			: [null, new Set()];
		let lastLevel = 1;
		let currentLevelHeadings = headingsByLevel[lastLevel];

		/**
		 * Gets the text of a heading node
		 * @param {HeadingNode} node The heading node
		 * @returns {string} The heading text
		 */
		function getHeadingText(node) {
			/*
			 * There are two types of headings in markdown:
			 * - ATX headings, which start with one or more # characters
			 * - Setext headings, which are underlined with = or -
			 * Setext headings are identified by being on two lines instead of one,
			 * with the second line containing only = or - characters. In order to
			 * get the correct heading text, we need to determine which type of
			 * heading we're dealing with.
			 */
			const isSetext =
				node.position.start.line !== node.position.end.line;

			return isSetext
				? // get only the text from the first line
					sourceCode.lines[node.position.start.line - 1].trim()
				: // get the text without the leading # characters
					sourceCode
						.getText(node)
						.slice(node.depth + 1)
						.trim();
		}

		return {
			heading(node) {
				const headingText = getHeadingText(node);

				if (checkSiblingsOnly) {
					const currentLevel = node.depth;

					const direction = currentLevel > lastLevel ? 1 : -1;
					while (lastLevel !== currentLevel) {
						if (direction > 0) {
							lastLevel++;
						} else {
							headingsByLevel[lastLevel].clear();
							lastLevel--;
						}
					}

					currentLevelHeadings = headingsByLevel[currentLevel];
				}

				if (currentLevelHeadings.has(headingText)) {
					context.report({
						loc: node.position,
						messageId: "duplicateHeading",
						data: {
							text: headingText,
						},
					});
				} else {
					currentLevelHeadings.add(headingText);
				}
			},
		};
	},
};
