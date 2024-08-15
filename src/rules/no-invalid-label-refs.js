/**
 * @fileoverview Rule to prevent non-complaint link references.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { findOffsets, illegalShorthandTailPattern } from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/** @typedef {import("unist").Position} Position */
/** @typedef {import("mdast").Text} TextNode */
/** @typedef {import("eslint").Rule.RuleModule} RuleModule */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

// matches i.e., [foo][bar]
const labelPattern = /\]\[([^\]]+)\]/u;


/**
 * Finds missing references in a node.
 * @param {TextNode} node The node to check.
 * @param {string} text The text of the node.
 * @returns {Array<{label:string,position:Position}>} The missing references.
 */
function findInvalidLabelReferences(node, text) {

    const invalid = [];
    let startIndex = 0;

    while (startIndex < node.value.length) {

        const value = node.value.slice(startIndex);
        const match = value.match(labelPattern);

        if (!match) {
            break;
        }

        if (!illegalShorthandTailPattern.test(match[0])) {
            continue;
        }

        let columnStart = startIndex + match.index + 1;

        // adding 1 to the index just in case we're in a ![] and need to skip the !.
        const startFrom = node.position.start.offset + startIndex + 1;
        const lastOpenBracket = text.lastIndexOf("[", startFrom);

        if (lastOpenBracket === -1) {
            startIndex += match.index + match[0].length;
            continue;
        }

        const label = text.slice(lastOpenBracket, columnStart + match[0].length).match(/!?\[([^\]]+)\]/u)?.[1];

        columnStart -= label.length;

        const {
            lineOffset,
            columnOffset
        } = findOffsets(node.value, columnStart);

        const line = node.position.start.line + lineOffset;

        /*
         * If the columnOffset is 0, then the column is at the start of the line.
         * In that case, we need to adjust the column number to be 1.
         */
        invalid.push({
            label: label.trim(),
            position: {
                start: {
                    line,
                    column: columnOffset || 1
                },
                end: {
                    line,
                    column: columnOffset + label.length
                }
            }
        });

        startIndex += match.index + match[0].length;
    }

    return invalid;

}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {RuleModule} */
export default {
    meta: {
        type: "problem",

        docs: {
            recommended: true,
            description: "Disallow invalid label references."
        },

        messages: {
            invalidLabelRef: "Label reference '{{label}}' is invalid due to white space between [ and ]."
        }
    },

    create(context) {

        const { sourceCode } = context;

        return {

            text(node) {
                const invalidReferences = findInvalidLabelReferences(node, sourceCode.text);

                for (const invalidReference of invalidReferences) {
                    context.report({
                        loc: invalidReference.position,
                        messageId: "invalidLabelRef",
                        data: {
                            label: invalidReference.label
                        }
                    });
                }
            }

        };
    }
};
