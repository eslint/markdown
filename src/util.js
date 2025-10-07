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
 * This preserves offsets and locations of characters
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
