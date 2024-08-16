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
        columnOffset
    };
}
