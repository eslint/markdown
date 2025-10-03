/**
 * @fileoverview Utility Library
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Regex Patterns
//-----------------------------------------------------------------------------

/**
 * CommonMark does not allow any white space between the brackets in a reference link.
 * If that pattern is detected, then it's treated as text and not as a link. This pattern
 * is used to detect that situation.
 */
export const illegalShorthandTailPattern = /\]\[\s+\]$/u;

/**
 * Regular expression to match HTML comments, including multiline comments.
 */
export const htmlCommentPattern = /<!--[\s\S]*?-->/gu;

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Finds the line and column offsets for a given offset in a string.
 * @param {string} text The text to search.
 * @param {number} offset The offset to find.
 * @returns {{lineOffset:number,columnOffset:number}} The location of the offset.
 *      Note that `columnOffset` should be used as an offset to the column number
 *      of the given text in the source code only when `lineOffset` is 0.
 *      Otherwise, it should be used as a 0-based column number in the source code.
 */
export function findOffsets(text, offset) {
	let lineOffset = 0;
	let columnOffset = 0;

	for (let i = 0; i < offset; i++) {
		if (text[i] === "\n") {
			lineOffset++;
			columnOffset = 0;
		} else {
			columnOffset++;
		}
	}

	return {
		lineOffset,
		columnOffset,
	};
}

/**
 * Checks if a frontmatter block contains a title matching the given pattern
 * @param {string} value The frontmatter content
 * @param {RegExp|null} pattern The pattern to match against
 * @returns {boolean} Whether a title was found
 */
export function frontmatterHasTitle(value, pattern) {
	if (!pattern) {
		return false;
	}
	const lines = value.split("\n");
	for (const line of lines) {
		if (pattern.test(line)) {
			return true;
		}
	}
	return false;
}

/**
 * Replaces all HTML comments with whitespace.
 * This preserves indexes and locations of characters
 * outside HTML comments by keeping line breaks and replacing
 * other code units with a space character.
 * @param {string} value The string to remove HTML comments from.
 * @returns {string} The string with HTML comments removed.
 */
export function stripHtmlComments(value) {
	return value.replace(htmlCommentPattern, match =>
		/* eslint-disable-next-line require-unicode-regexp
		   -- we want to replace each code unit with a space
		*/
		match.replace(/[^\r\n]/g, " "),
	);
}
