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
// Helpers
//-----------------------------------------------------------------------------

/**
 * This pattern does not match backslash-escaped `#` characters
 * @example
 * ```markdown
 * <!-- OK -->
 * ### foo ###
 * ## foo ###
 * # foo #
 *
 * <!-- NOT OK -->
 * ### foo \###
 * ## foo #\##
 * # foo \#
 * ```
 *
 * @see https://spec.commonmark.org/0.31.2/#example-76
 */
const trailingAtxHeadingHashPattern = /[ \t]+#+[ \t]*$/u;
const leadingAtxHeadingHashPattern = /^#{1,6}[ \t]+/u;

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

		/**
		 * Gets the text of a heading node
		 * @param {HeadingNode} node The heading node
		 * @returns {string} The heading text
		 */
		function getHeadingText(node) {
			/*
			 * There are two types of headings in markdown:
			 * - ATX headings, which consist of 1-6 # characters followed by content
			 *   and optionally ending with any number of # characters
			 * - Setext headings, which are underlined with = or -
			 *   Setext headings are identified by being on two lines instead of one,
			 *   with the second line containing only = or - characters. In order to
			 *   get the correct heading text, we need to determine which type of
			 *   heading we're dealing with.
			 */
			const isSetext =
				node.position.start.line !== node.position.end.line;

			if (isSetext) {
				// get only the text from the first line
				return sourceCode.lines[node.position.start.line - 1].trim();
			}

			// For ATX headings, get the text between the # characters
			const text = sourceCode.getText(node);

			/*
			 * Please avoid using `String.prototype.trim()` here,
			 * as it would remove intentional non-breaking space (NBSP) characters.
			 */
			return text
				.replace(leadingAtxHeadingHashPattern, "") // Remove leading # characters
				.replace(trailingAtxHeadingHashPattern, ""); // Remove trailing # characters
		}

		return {
			heading(node) {
				const headingText = getHeadingText(node);

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
