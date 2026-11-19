/**
 * @fileoverview Rule to disallow paragraphs that look like ATX headings in Markdown.
 * @author Gaic4o
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { FootnoteDefinition, Html, Image, ImageReference, InlineCode, Link, LinkReference, Parents } from "mdast";
 * @import { InlineMath } from "mdast-util-math";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"headingLikeParagraph" | "useMaxDepthHashes" | "escapeLeadingHash"} NoHeadingLikeParagraphMessageIds
 * @typedef {[]} NoHeadingLikeParagraphOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoHeadingLikeParagraphOptions, MessageIds: NoHeadingLikeParagraphMessageIds }>} NoHeadingLikeParagraphRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/** Matches a line of text. U+2028 and U+2029 aren't line endings in Markdown, so the `m` flag can't be used instead. */
const linePattern = /(?<=^|\r\n|[\r\n])[^\r\n]*/gu;

/** Matches seven or more hash characters followed by a space, a tab, or the end of the line, like the opening sequence of an ATX heading. */
const headingLikeParagraphPattern = /^(?<hashes>#{7,})(?=[ \t]|$)/u;

/** Matches the checkbox of a GFM task list item and the whitespace after it, at the end of a line's prefix. */
const checkboxPattern = /\[[ x]\][ \t]*$/iu;

/** The width of a tab stop. */
const tabSize = 4;

/** The columns of indentation a continuation line needs to stay inside a footnote definition. */
const footnoteDefinitionIndent = 4;

/** The longest opening sequence an ATX heading allows. */
const maxDepthHashes = "######";

/** The character that replaces masked source text. It isn't whitespace, `>`, or `#`, so a masked range can't be taken for a container prefix or an opening sequence. */
const maskCharacter = "\uFFFD";

/**
 * Returns the number of columns the text spans, with tabs reaching the next tab stop.
 * @param {string} text The text to measure.
 * @returns {number} The width in columns.
 */
function getWidth(text) {
	let width = 0;

	for (const character of text) {
		width += character === "\t" ? tabSize - (width % tabSize) : 1;
	}

	return width;
}

/**
 * Returns the content of a continuation line of a paragraph, without the container
 * prefixes and indentation that precede it, or `null` if a heading couldn't open there.
 *
 * The block quote markers and the indentation of list items and footnote definitions
 * take up the columns before the paragraph's content, so those columns are skipped as
 * long as they hold only whitespace and `>`. A line that has fewer of them is a lazy
 * continuation line, where a heading can still open. Up to three further columns of
 * indentation are allowed, as for any ATX heading, while four or more mean the line
 * continues the paragraph instead.
 * @param {string} line The line, including its prefixes.
 * @param {number} prefixWidth The columns taken up by the container prefixes.
 * @returns {string | null} The content of the line, or `null`.
 */
function getContent(line, prefixWidth) {
	let index = 0;
	let width = 0;
	let markerWidth = 0; // the columns up to the end of the last block quote marker

	while (width < prefixWidth && /[ \t>]/u.test(line[index])) {
		const character = line[index++];

		width += character === "\t" ? tabSize - (width % tabSize) : 1;

		if (character === ">") {
			// The marker includes one column of the whitespace that follows it.
			markerWidth = width + (/[ \t]/u.test(line[index]) ? 1 : 0);
		}
	}

	// On a lazy continuation line, the whitespace after the last marker is indentation.
	const contentWidth = width < prefixWidth ? markerWidth : prefixWidth;

	while (width - contentWidth < tabSize && /[ \t]/u.test(line[index])) {
		width += line[index++] === "\t" ? tabSize - (width % tabSize) : 1;
	}

	return width - contentWidth < tabSize ? line.slice(index) : null;
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default /** @satisfies {NoHeadingLikeParagraphRuleDefinition} */ ({
	meta: {
		type: "problem",
		languages: ["markdown/commonmark", "markdown/gfm"],

		docs: {
			description: "Disallow paragraphs that look like ATX headings",
			dialects: ["CommonMark", "GFM"],
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

		/** @type {string[]} */
		let buffer;
		/** @type {number} */
		let nodeStartOffset;

		return {
			paragraph(node) {
				/*
				 * Read the raw source text instead of the `value` of the first `text`
				 * child, because `value` already resolves character escapes and character
				 * references. Both `\####### Foo` and `&#35;###### Foo` render as a
				 * paragraph whose text starts with seven hash characters, but in each case
				 * the author escaped the leading hash on purpose.
				 *
				 * Use UTF-16 code units so the buffer stays aligned with source offsets.
				 */
				buffer = sourceCode.getText(node).split("");
				nodeStartOffset = node.position.start.offset;
			},

			"paragraph :matches(html, image, imageReference, inlineCode, link, linkReference, inlineMath)"(
				/** @type {Html | Image | ImageReference | InlineCode | Link | LinkReference | InlineMath} */ node,
			) {
				const [startOffset, endOffset] = sourceCode.getRange(node);

				/*
				 * Mask the content of `html`, `image`, `imageReference`, `inlineCode`,
				 * `link`, `linkReference`, and `inlineMath` nodes, which may span lines.
				 * Hash characters inside them belong to the node rather than to the
				 * paragraph's own text.
				 */
				for (let i = startOffset; i < endOffset; i++) {
					buffer[i - nodeStartOffset] = maskCharacter;
				}
			},

			"paragraph:exit"(node) {
				const maskedText = buffer.join("");
				const { line, column } = node.position.start;

				/*
				 * On the paragraph's first line, the text before the paragraph holds
				 * the prefixes of its containers, which each continuation line repeats.
				 */
				let prefix = sourceCode.lines[line - 1].slice(0, column - 1);

				/*
				 * The paragraph of a GFM task list item begins after the checkbox, so
				 * its first line can't open a heading. The checkbox belongs to the
				 * list item's content rather than to its prefix.
				 */
				const parent = /** @type {Parents} */ (
					sourceCode.getParent(node)
				);
				const followsCheckbox =
					parent.type === "listItem" &&
					typeof parent.checked === "boolean" &&
					parent.children[0] === node;

				if (followsCheckbox) {
					prefix = prefix.replace(checkboxPattern, "");
				}

				/*
				 * The continuation lines of a footnote definition are indented by four
				 * columns, however long its label is.
				 */
				const footnoteDefinition =
					/** @type {FootnoteDefinition | undefined} */ (
						sourceCode
							.getAncestors(node)
							.find(
								ancestor =>
									ancestor.type === "footnoteDefinition",
							)
					);

				if (footnoteDefinition?.position.start.line === line) {
					const labelStart =
						footnoteDefinition.position.start.column - 1;
					const labelEnd =
						footnoteDefinition.children[0].position.start.column -
						1;

					prefix = `${prefix.slice(0, labelStart)}${" ".repeat(footnoteDefinitionIndent)}${prefix.slice(labelEnd)}`;
				}

				const prefixWidth = getWidth(prefix);

				for (const lineMatch of maskedText.matchAll(linePattern)) {
					if (lineMatch.index === 0 && followsCheckbox) {
						continue;
					}

					// The first line's prefixes and indentation precede the paragraph.
					const content =
						lineMatch.index === 0
							? lineMatch[0]
							: getContent(lineMatch[0], prefixWidth);

					if (content === null) {
						continue;
					}

					const match = headingLikeParagraphPattern.exec(content);

					if (match === null) {
						continue;
					}

					const { hashes } = match.groups;
					const startOffset =
						nodeStartOffset +
						lineMatch.index +
						(lineMatch[0].length - content.length);
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
