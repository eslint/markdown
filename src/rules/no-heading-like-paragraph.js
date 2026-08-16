/**
 * @fileoverview Rule to disallow paragraphs that look like ATX headings in Markdown.
 * @author Gaic4o
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"headingLikeParagraph" | "useMaxDepthHashes" | "escapeLeadingHash"} NoHeadingLikeParagraphMessageIds
 * @typedef {[]} NoHeadingLikeParagraphOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoHeadingLikeParagraphOptions, MessageIds: NoHeadingLikeParagraphMessageIds }>} NoHeadingLikeParagraphRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Matches seven or more hash characters at the start of a paragraph, followed by a
 * space, a tab, a line ending, or the end of the paragraph. This mirrors the way
 * CommonMark delimits the opening sequence of an ATX heading, so a no-break space
 * doesn't count as a delimiter.
 */
const headingLikeParagraphPattern = /^#{7,}(?=[ \t\r\n]|$)/u;

/** The longest opening sequence an ATX heading allows. */
const maxDepthHashes = "######";

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default /** @satisfies {NoHeadingLikeParagraphRuleDefinition} */ ({
	meta: {
		type: "problem",

		docs: {
			recommended: false,
			description: "Disallow paragraphs that look like ATX headings",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-heading-like-paragraph.md",
		},

		hasSuggestions: true,

		messages: {
			headingLikeParagraph:
				"Unexpected paragraph starting with {{count}} hash characters. ATX headings support at most 6.",
			useMaxDepthHashes: 'Replace "{{hashes}}" with "{{maxDepthHashes}}".',
			escapeLeadingHash: "Escape the leading hash character.",
		},
	},

	create(context) {
		const { sourceCode } = context;

		return {
			paragraph(node) {
				/*
				 * Read the raw source text instead of the `value` of the first `text`
				 * child, because `value` already resolves character escapes and character
				 * references. Both `\####### Foo` and `&#35;###### Foo` render as a
				 * paragraph whose text starts with seven hash characters, but in each case
				 * the author escaped the leading hash on purpose.
				 */
				const match = headingLikeParagraphPattern.exec(
					sourceCode.getText(node),
				);

				if (match === null) {
					return;
				}

				const [hashes] = match;
				const startOffset = node.position.start.offset;
				const endOffset = startOffset + hashes.length;

				context.report({
					loc: {
						start: sourceCode.getLocFromIndex(startOffset),
						end: sourceCode.getLocFromIndex(endOffset),
					},
					messageId: "headingLikeParagraph",
					data: { count: hashes.length },

					/*
					 * There's no autofix, because the number of hash characters alone
					 * doesn't reveal which of the two corrections the author intended.
					 */
					suggest: [
						{
							messageId: "useMaxDepthHashes",
							data: { hashes, maxDepthHashes },
							fix(fixer) {
								return fixer.replaceTextRange(
									[startOffset, endOffset],
									maxDepthHashes,
								);
							},
						},
						{
							messageId: "escapeLeadingHash",
							fix(fixer) {
								return fixer.insertTextBeforeRange(
									[startOffset, startOffset + 1],
									"\\",
								);
							},
						},
					],
				});
			},
		};
	},
});
