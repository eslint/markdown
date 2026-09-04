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
 * Matches seven or more hash characters at the start of a line within a paragraph,
 * followed by a space, a tab, a line ending, or the end of the paragraph. This mirrors
 * the way CommonMark delimits the opening sequence of an ATX heading, so a no-break
 * space doesn't count as a delimiter.
 *
 * This pattern avoids the `m` flag, which would also treat U+2028 and U+2029 as line
 * boundaries even though Markdown doesn't. `(?:^|(?<=[\r\n]))` starts a new line only
 * after an actual carriage return or line feed.
 *
 * Block quote markers and up to three spaces of indentation may precede the hash
 * characters, because a heading with six or fewer hash characters would still open in
 * that position.
 */
const headingLikeParagraphPattern =
	/(?:^|(?<=[\r\n]))(?: {0,3}>[ \t]?)* {0,3}(?<hashes>#{7,})(?=[ \t\r\n]|$)/gu;

/** The longest opening sequence an ATX heading allows. */
const maxDepthHashes = "######";

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default /** @satisfies {NoHeadingLikeParagraphRuleDefinition} */ ({
	meta: {
		type: "problem",

		docs: {
			description: "Disallow paragraphs that look like ATX headings",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-heading-like-paragraph.md",
		},

		hasSuggestions: true,

		messages: {
			headingLikeParagraph:
				"Unexpected paragraph starting with {{count}} hash characters. ATX headings support at most 6.",
			useMaxDepthHashes:
				'Replace "{{hashes}}" with "{{maxDepthHashes}}".',
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
				const text = sourceCode.getText(node);

				/** @type {RegExpExecArray | null} */
				let match;

				while (
					(match = headingLikeParagraphPattern.exec(text)) !== null
				) {
					const { hashes } = match.groups;
					const startOffset =
						node.position.start.offset +
						match.index +
						match[0].length -
						hashes.length;
					const endOffset = startOffset + hashes.length;

					context.report({
						loc: {
							start: sourceCode.getLocFromIndex(startOffset),
							end: sourceCode.getLocFromIndex(endOffset),
						},
						messageId: "headingLikeParagraph",
						data: { count: hashes.length },
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
				}
			},
		};
	},
});
