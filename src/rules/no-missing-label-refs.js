/**
 * @fileoverview Rule to prevent missing label references in Markdown.
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

const labelPatterns = [

    // [foo][bar]
    /\]\[([^\]]+)\]/u,

    // [foo][]
    /(\]\[\])/u,

    // [foo]
    /\[([^\]]+)\]/u
];

const shorthandTailPattern = /\]\[\]$/u;

/**
 * Finds missing references in a node.
 * @param {TextNode} node The node to check.
 * @param {string} docText The text of the node.
 * @returns {Array<{label:string,position:Position}>} The missing references.
 */
function findMissingReferences(node, docText) {

    const missing = [];
    let startIndex = 0;
    const offset = node.position.start.offset;
    const nodeStartLine = node.position.start.line;
    const nodeStartColumn = node.position.start.column;

    /*
     * This loop works by searching the string inside the node for the next
     * label reference. If there is, it reports an error.
     * It then moves the start index to the end of the label reference and
     * continues searching the text until the end of the text is found.
     */
    while (startIndex < node.value.length) {

        const value = node.value.slice(startIndex);

        const match = labelPatterns.reduce((previous, pattern) => {
            if (previous) {
                return previous;
            }

            return value.match(pattern);
        }, null);

        // check for array instead of null to appease TypeScript
        if (!Array.isArray(match)) {
            break;
        }

        // skip illegal shorthand tail -- handled by no-invalid-label-refs
        if (illegalShorthandTailPattern.test(match[0])) {
            startIndex += match.index + match[0].length;
            continue;
        }


        // Calculate the match index relative to just the node.
        let columnStart = startIndex + match.index;
        let label = match[1];

        // need to look backward to get the label
        if (shorthandTailPattern.test(match[0])) {

            // adding 1 to the index just in case we're in a ![] and need to skip the !.
            const startFrom = offset + startIndex + 1;
            const lastOpenBracket = docText.lastIndexOf("[", startFrom);

            if (lastOpenBracket === -1) {
                startIndex += match.index + match[0].length;
                continue;
            }

            label = docText.slice(lastOpenBracket, match.index + match[0].length).match(/!?\[([^\]]+)\]/u)?.[1];
            columnStart -= label.length;
        } else if (match[0].startsWith("]")) {
            columnStart += 2;
        } else {
            columnStart += 1;
        }

        const {
            lineOffset: startLineOffset,
            columnOffset: startColumnOffset
        } = findOffsets(node.value, columnStart);

        const startLine = nodeStartLine + startLineOffset;
        const startColumn = nodeStartColumn + startColumnOffset;

        missing.push({
            label: label.trim(),
            position: {
                start: {
                    line: startLine,
                    column: startColumn
                },
                end: {
                    line: startLine,
                    column: startColumn + label.length
                }
            }
        });

        startIndex += match.index + match[0].length;
    }

    return missing;

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
            description: "Disallow missing label references."
        },

        messages: {
            notFound: "Label reference '{{label}}' not found."
        }
    },

    create(context) {

        const { sourceCode } = context;
        let allMissingReferences = [];

        return {

            "root:exit"() {

                for (const missingReference of allMissingReferences) {
                    context.report({
                        loc: missingReference.position,
                        messageId: "notFound",
                        data: {
                            label: missingReference.label
                        }
                    });
                }

            },

            text(node) {
                allMissingReferences.push(...findMissingReferences(node, sourceCode.text));
            },

            definition(node) {

                /*
                 * Sometimes a poorly-formatted link will end up a text node instead of a link node
                 * even though the label definition exists. Here, we remove any missing references
                 * that have a matching label definition.
                 */
                allMissingReferences = allMissingReferences.filter(
                    missingReference => missingReference.label !== node.identifier
                );
            }
        };
    }
};
