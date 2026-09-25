/**
 * @fileoverview Rule to disallow paragraphs that look like ATX headings in Markdown.
 * @author Gaic4o
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { Blockquote, FootnoteDefinition, Image, InlineCode, Link, ListItem, Node, Paragraph } from "mdast";
 * @import { MarkdownSourceCode } from "../language/markdown-source-code.js";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"headingLikeParagraph" | "useMaxDepthHashes" | "escapeLeadingHash"} NoHeadingLikeParagraphMessageIds
 * @typedef {[]} NoHeadingLikeParagraphOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoHeadingLikeParagraphOptions, MessageIds: NoHeadingLikeParagraphMessageIds }>} NoHeadingLikeParagraphRuleDefinition
 * @typedef {Blockquote | ListItem | FootnoteDefinition} Container
 * @typedef {"blockquote" | number} ContainerPrefix A block quote marker, or a number of columns of indentation.
 */

/**
 * @typedef {Object} Cursor A position in a line of text.
 * @property {number} index The index of the next character to read.
 * @property {number} column The number of columns consumed so far on the line. A tab
 * spans the columns up to the next multiple of `tabSize`, and a partially consumed tab
 * leaves the index on the tab while the column moves into it.
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Matches seven or more hash characters at the current position, followed by a space, a
 * tab, a line ending, or the end of the paragraph. This mirrors the way CommonMark
 * delimits the opening sequence of an ATX heading, so a no-break space doesn't count as
 * a delimiter.
 */
const hashesPattern = /(?<hashes>#{7,})(?=[ \t\r\n]|$)/uy;

/**
 * Matches a Markdown line ending. This rule never relies on the `m` flag, which would
 * also treat U+2028 and U+2029 as line boundaries even though Markdown doesn't.
 */
const lineEndingPattern = /\r\n|\r|\n/gu;

/** Matches a list marker: a bullet, or up to nine digits followed by `.` or `)`. */
const listItemMarkerPattern = /[*+-]|\d{1,9}[.)]/uy;

/**
 * The width of a tab stop. Where whitespace defines block structure, CommonMark treats a
 * tab as reaching the next multiple of this many columns, and this many columns of
 * indentation are too many for a heading to open.
 */
const tabSize = 4;

/** The columns of indentation a continuation line needs to stay inside a footnote definition. */
const footnoteDefinitionIndent = 4;

/** The longest opening sequence an ATX heading allows. */
const maxDepthHashes = "######";

/**
 * Replaces source text that mustn't take part in heading detection, such as the content
 * of a code span. It isn't whitespace, `>`, or `#`, so a masked range can neither pass
 * as indentation or a block quote marker nor look like an opening sequence.
 */
const maskCharacter = "\uFFFD";

/**
 * Checks whether a node is a container block whose continuation lines repeat a prefix.
 * @param {Node} node The node to check.
 * @returns {node is Container} Whether the node is a container.
 */
function isContainer(node) {
	return (
		node.type === "blockquote" ||
		node.type === "listItem" ||
		node.type === "footnoteDefinition"
	);
}

/**
 * Consumes up to `max` columns of spaces and tabs. A tab may be consumed partially, in
 * which case its remaining columns count as spaces for whatever follows.
 * @param {string} text The text to read.
 * @param {Cursor} cursor The position to read from.
 * @param {number} max The most columns to consume.
 * @returns {number} The number of columns consumed.
 */
function consumeIndent(text, cursor, max) {
	let consumed = 0;

	while (consumed < max) {
		const character = text[cursor.index];

		if (character !== " " && character !== "\t") {
			break;
		}

		cursor.column++;
		consumed++;

		if (character === " " || cursor.column % tabSize === 0) {
			cursor.index++;
		}
	}

	return consumed;
}

/**
 * Consumes exactly `columns` columns of indentation, or nothing at all.
 * @param {string} text The text to read.
 * @param {Cursor} cursor The position to read from.
 * @param {number} columns The number of columns to consume.
 * @returns {boolean} Whether the indentation was found.
 */
function skipIndent(text, cursor, columns) {
	const { index, column } = cursor;

	if (consumeIndent(text, cursor, columns) === columns) {
		return true;
	}

	cursor.index = index;
	cursor.column = column;
	return false;
}

/**
 * Advances the cursor to the given index, counting the columns of the characters it
 * passes over.
 * @param {string} text The text to read.
 * @param {Cursor} cursor The position to advance.
 * @param {number} index The index to advance to.
 * @returns {void}
 */
function advanceTo(text, cursor, index) {
	while (cursor.index < index) {
		cursor.column +=
			text[cursor.index] === "\t"
				? tabSize - (cursor.column % tabSize)
				: 1;
		cursor.index++;
	}
}

/**
 * Consumes a block quote marker: up to three columns of indentation, `>`, and the one
 * column of whitespace that belongs to the marker, if present.
 * @param {string} text The text to read.
 * @param {Cursor} cursor The position to read from.
 * @returns {boolean} Whether a marker was found.
 */
function skipBlockQuoteMarker(text, cursor) {
	const { index, column } = cursor;

	consumeIndent(text, cursor, tabSize - 1);

	if (text[cursor.index] !== ">") {
		cursor.index = index;
		cursor.column = column;
		return false;
	}

	cursor.index++;
	cursor.column++;
	consumeIndent(text, cursor, 1);
	return true;
}

/**
 * Consumes the indentation before a list item's marker, the marker, and the whitespace
 * that belongs to it. CommonMark gives the marker the one to four columns of whitespace
 * that follow it when content follows on the same line. When five or more columns follow
 * (the item starts with an indented code block) or nothing follows on that line, the
 * marker gets exactly one column instead.
 * @param {string} text The text to read.
 * @param {Cursor} cursor The position to read from.
 * @param {ListItem} listItem The list item.
 * @returns {void}
 */
function skipListItemMarker(text, cursor, listItem) {
	advanceTo(text, cursor, listItem.position.start.offset);

	listItemMarkerPattern.lastIndex = cursor.index;

	const markerLength = listItemMarkerPattern.exec(text)[0].length;

	cursor.index += markerLength;
	cursor.column += markerLength;

	const { index, column } = cursor;

	consumeIndent(text, cursor, tabSize);

	const next = text[cursor.index];

	if (
		next === undefined ||
		next === " " ||
		next === "\t" ||
		next === "\n" ||
		next === "\r"
	) {
		cursor.index = index;
		cursor.column = column;

		if (consumeIndent(text, cursor, 1) === 0) {
			cursor.column++;
		}
	}
}

/**
 * Advances past the prefixes that a continuation line repeats to stay inside each
 * container, from the outermost inward. CommonMark stops at the first prefix that's
 * missing; a block that starts on that line, such as an ATX heading, opens at that level.
 * @param {string} text The text to read.
 * @param {Cursor} cursor The position to read from.
 * @param {ContainerPrefix[]} prefixes The container prefixes.
 * @returns {void}
 */
function skipContinuationPrefixes(text, cursor, prefixes) {
	for (const prefix of prefixes) {
		const found =
			prefix === "blockquote"
				? skipBlockQuoteMarker(text, cursor)
				: skipIndent(text, cursor, prefix);

		if (!found) {
			return;
		}
	}
}

/**
 * Returns the columns of indentation a continuation line needs to stay inside a list
 * item: the width of the marker and its whitespace, plus any indentation before the
 * marker, measured from where the enclosing container's prefix ends on the marker's line.
 * @param {ListItem} listItem The list item to measure.
 * @param {Container[]} enclosingContainers The containers around the list item, outermost first.
 * @param {ContainerPrefix[]} enclosingPrefixes The prefixes of those containers.
 * @param {MarkdownSourceCode} sourceCode The Markdown source code object.
 * @returns {number} The width of the list item's content indentation.
 */
function getListItemIndent(
	listItem,
	enclosingContainers,
	enclosingPrefixes,
	sourceCode,
) {
	const { text } = sourceCode;
	const { offset, column } = listItem.position.start;
	const lineStartIndex = offset - (column - 1);
	const cursor = { index: lineStartIndex, column: 0 };

	/*
	 * Containers that started on an earlier line contribute their continuation prefix.
	 * Containers that start on this line follow them and contribute their opening prefix.
	 */
	let firstOnLine = enclosingContainers.findIndex(
		container => container.position.start.offset >= lineStartIndex,
	);

	if (firstOnLine === -1) {
		firstOnLine = enclosingContainers.length;
	}

	skipContinuationPrefixes(
		text,
		cursor,
		enclosingPrefixes.slice(0, firstOnLine),
	);

	for (let i = firstOnLine; i < enclosingContainers.length; i++) {
		const container = enclosingContainers[i];

		switch (container.type) {
			case "blockquote":
				skipBlockQuoteMarker(text, cursor);
				break;

			case "listItem":
				skipListItemMarker(text, cursor, container);
				break;

			case "footnoteDefinition": {
				/*
				 * A footnote definition's label consumes all of the whitespace after
				 * it, so its content begins where the next container's prefix starts.
				 */
				const next = enclosingContainers[i + 1] ?? listItem;

				advanceTo(text, cursor, next.position.start.offset);
				break;
			}

			// no default
		}
	}

	const startColumn = cursor.column;

	skipListItemMarker(text, cursor, listItem);

	return cursor.column - startColumn;
}

/**
 * Checks whether a character is a space, a tab, or part of a line ending.
 * @param {string} character The character to check.
 * @returns {boolean} Whether the character is whitespace.
 */
function isWhitespace(character) {
	return (
		character === " " ||
		character === "\t" ||
		character === "\n" ||
		character === "\r"
	);
}

/**
 * Checks whether the character at the given index is backslash-escaped.
 * @param {string} text The text to read.
 * @param {number} index The index of the character.
 * @returns {boolean} Whether an odd number of backslashes precedes the character.
 */
function isEscaped(text, index) {
	let backslashes = 0;

	while (text[index - backslashes - 1] === "\\") {
		backslashes++;
	}

	return backslashes % 2 === 1;
}

/**
 * Returns the range of a link's or image's title, including its delimiters, by reading
 * the source backward from the closing `)` of the resource. The title is the last part
 * of the resource, so its closing delimiter is the last character before that `)` that
 * isn't whitespace.
 *
 * A quoted title can't contain its delimiter unescaped, so the nearest unescaped one
 * opens it. The parser allows an unescaped `(` inside a parenthesized title, so the
 * nearest `(` isn't necessarily the opening one. The opening `(` always follows the
 * whitespace that separates the destination from the title, so the outermost `(` after
 * whitespace is used. That search stops at an unescaped `)`, which can't occur inside
 * the title, and at the `(` that opens the resource after the `]` of the link text or
 * image description.
 *
 * If no opening delimiter is found, the range is empty and nothing is masked, so a
 * heading-like line is never hidden by mistake.
 * @param {Link | Image} node The link or image node, which must have a title.
 * @param {MarkdownSourceCode} sourceCode The Markdown source code object.
 * @returns {[number, number]} The range of the title.
 */
function getTitleRange(node, sourceCode) {
	const { text } = sourceCode;
	const [startOffset, endOffset] = sourceCode.getRange(node);
	let index = endOffset - 2; // the character before the closing ")"

	while (isWhitespace(text[index])) {
		index--;
	}

	const closingIndex = index;
	const closingDelimiter = text[closingIndex];
	let openingIndex = closingIndex;

	if (closingDelimiter === ")") {
		for (index--; index > startOffset; index--) {
			if (isEscaped(text, index)) {
				continue;
			}

			const character = text[index];

			if (
				character === ")" ||
				(character === "(" &&
					text[index - 1] === "]" &&
					!isEscaped(text, index - 1))
			) {
				break;
			}

			if (character === "(" && isWhitespace(text[index - 1])) {
				openingIndex = index;
			}
		}
	} else {
		for (index--; index > startOffset; index--) {
			if (text[index] === closingDelimiter && !isEscaped(text, index)) {
				openingIndex = index;
				break;
			}
		}
	}

	return [openingIndex, closingIndex + 1];
}

/**
 * Returns the prefixes a continuation line of a paragraph repeats to stay inside each
 * enclosing container, ordered from the outermost container to the innermost.
 * @param {Paragraph} node The paragraph node.
 * @param {MarkdownSourceCode} sourceCode The Markdown source code object.
 * @returns {ContainerPrefix[]} The container prefixes.
 */
function getContainerPrefixes(node, sourceCode) {
	const containers = sourceCode.getAncestors(node).filter(isContainer);

	/** @type {ContainerPrefix[]} */
	const prefixes = [];

	for (const [i, container] of containers.entries()) {
		switch (container.type) {
			case "blockquote":
				prefixes.push("blockquote");
				break;

			case "listItem":
				prefixes.push(
					getListItemIndent(
						container,
						containers.slice(0, i),
						prefixes,
						sourceCode,
					),
				);
				break;

			case "footnoteDefinition":
				prefixes.push(footnoteDefinitionIndent);
				break;

			// no default
		}
	}

	return prefixes;
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

		/**
		 * Masks a range of the current paragraph's source text.
		 * @param {number} startOffset The offset at which the range begins.
		 * @param {number} endOffset The offset at which the range ends.
		 * @returns {void}
		 */
		function maskRange(startOffset, endOffset) {
			for (let i = startOffset; i < endOffset; i++) {
				buffer[i - nodeStartOffset] = maskCharacter;
			}
		}

		return {
			paragraph(node) {
				/*
				 * Read the raw source text instead of the `value` of the first `text`
				 * child, because `value` already resolves character escapes and character
				 * references. Both `\####### Foo` and `&#35;###### Foo` render as a
				 * paragraph whose text starts with seven hash characters, but in each case
				 * the author escaped the leading hash on purpose.
				 *
				 * Split into UTF-16 code units so the buffer stays aligned with source
				 * offsets while inline nodes are masked.
				 */
				buffer = sourceCode.getText(node).split("");
				nodeStartOffset = node.position.start.offset;
			},

			"paragraph inlineCode"(/** @type {InlineCode} */ node) {
				/*
				 * A code span that spans lines can put hash characters at the start of
				 * a line, but they're code rather than paragraph text, and both
				 * suggestions would change the code.
				 */
				maskRange(...sourceCode.getRange(node));
			},

			"paragraph :matches(link, image)"(
				/** @type {Link | Image} */ node,
			) {
				/*
				 * The same goes for a title that spans lines. The link text and the
				 * image description stay visible, because they're still paragraph text
				 * and a heading with six hash characters would break the link or image
				 * there just as it would anywhere else in the paragraph.
				 */
				if (typeof node.title === "string") {
					maskRange(...getTitleRange(node, sourceCode));
				}
			},

			"paragraph:exit"(node) {
				const text = buffer.join("");
				const containerPrefixes = getContainerPrefixes(
					node,
					sourceCode,
				);
				const lineStartIndexes = [0];

				for (const lineEnding of text.matchAll(lineEndingPattern)) {
					lineStartIndexes.push(
						lineEnding.index + lineEnding[0].length,
					);
				}

				for (const [
					lineNumber,
					lineStartIndex,
				] of lineStartIndexes.entries()) {
					const cursor = { index: lineStartIndex, column: 0 };

					/*
					 * The paragraph's position begins after the container prefixes and
					 * indentation of its first line, so only the lines after a line
					 * ending still carry them. Indentation that a container consumes
					 * doesn't count toward the three columns a heading allows, and a
					 * line indented by four or more columns after its prefixes continues
					 * the paragraph instead of opening a heading.
					 */
					if (lineNumber > 0) {
						skipContinuationPrefixes(
							text,
							cursor,
							containerPrefixes,
						);

						if (consumeIndent(text, cursor, tabSize) === tabSize) {
							continue;
						}
					}

					hashesPattern.lastIndex = cursor.index;

					const match = hashesPattern.exec(text);

					if (match === null) {
						continue;
					}

					const { hashes } = match.groups;
					const startOffset = nodeStartOffset + match.index;
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
