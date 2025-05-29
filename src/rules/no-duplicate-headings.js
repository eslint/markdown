/**
 * @fileoverview Rule to prevent duplicate headings in Markdown.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/** @typedef {import("mdast").Heading} HeadingNode */
/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: [{ siblingsOnly?: boolean; }]; }>}
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
					siblingsOnly: {
						type: "boolean",
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [{ siblingsOnly: false }],
	},

	create(context) {
		const [{ siblingsOnly }] = context.options;
		const { sourceCode } = context;

		const headingsByLevel = [null, []];
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

				if (siblingsOnly) {
					const currentLevel = node.depth;
					while (lastLevel < currentLevel) {
						lastLevel++;
						headingsByLevel[lastLevel] = [];
					}

					while (lastLevel > currentLevel) {
						headingsByLevel[lastLevel] = [];
						lastLevel--;
					}

					currentLevelHeadings = headingsByLevel[currentLevel];
				}

				if (currentLevelHeadings.includes(headingText)) {
					context.report({
						loc: node.position,
						messageId: "duplicateHeading",
						data: {
							text: headingText,
						},
					});
				} else {
					currentLevelHeadings.push(headingText);
				}
			},
		};
	},
};
