/**
 * @fileoverview Utility Library
 * @author Nicholas C. Zakas
 */

/*
 * CommonMark does not allow any white space between the brackets in a reference link.
 * If that pattern is detected, then it's treated as text and not as a link. This pattern
 * is used to detect that situation.
 */
export const illegalShorthandTailPattern = /\]\[\s+\]$/u;

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
