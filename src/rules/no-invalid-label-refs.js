/**
 * @fileoverview Rule to prevent non-complaint link references.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { illegalShorthandTailPattern } from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { Position } from "unist";
 * @import { Text } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @import { MarkdownSourceCode } from "../language/markdown-source-code.js";
 * @typedef {"invalidLabelRef"} NoInvalidLabelRefsMessageIds
 * @typedef {[]} NoInvalidLabelRefsOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoInvalidLabelRefsOptions, MessageIds: NoInvalidLabelRefsMessageIds }>} NoInvalidLabelRefsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/** matches i.e., `[foo][bar]` */
const labelPattern = /\]\[([^\]]+)\]/u;

/**
 * Checks whether a character is escaped by consecutive backslashes.
 * @param {string} text The document text.
 * @param {number} index The character offset.
 * @returns {boolean} Whether the character is escaped.
 */
function isEscaped(text, index) {
	let count = 0;

	for (let i = index - 1; i >= 0 && text[i] === "\\"; i--) {
		count++;
	}

	return count % 2 === 1;
}

/**
 * Finds the opening bracket paired with a closing bracket.
 * @param {string} text The document text.
 * @param {number} closeIndex The closing bracket offset.
 * @returns {number} The opening bracket offset, or -1 if none exists.
 */
function findOpeningBracket(text, closeIndex) {
	let depth = 1;

	for (let i = closeIndex - 1; i >= 0; i--) {
		const character = text[i];

		if (character !== "[" && character !== "]") {
			continue;
		}

		if (isEscaped(text, i)) {
			continue;
		}

		if (character === "]") {
			depth++;
		} else {
			depth--;
			if (depth === 0) {
				return i;
			}
		}
	}
	return -1;
}

/**
 * Finds missing references in a node.
 * @param {Text} node The node to check.
 * @param {MarkdownSourceCode} sourceCode The Markdown source code object.
 * @returns {Array<{label:string,position:Position}>} The missing references.
 */
function findInvalidLabelReferences(node, sourceCode) {
	const nodeText = sourceCode.getText(node);
	const docText = sourceCode.text;
	const invalid = [];
	let startIndex = 0;

	/*
	 * This loop works by searching the string inside the node for the next
	 * label reference. If it finds one, it checks to see if there is any
	 * white space between the [ and ]. If there is, it reports an error.
	 * It then moves the start index to the end of the label reference and
	 * continues searching the text until the end of the text is found.
	 */
	while (startIndex < nodeText.length) {
		const value = nodeText.slice(startIndex);
		const match = value.match(labelPattern);

		if (!match) {
			break;
		}

		if (!illegalShorthandTailPattern.test(match[0])) {
			startIndex += match.index + match[0].length;
			continue;
		}

		/*
		 * Adjust `labelPattern` match index to the full source code.
		 */
		const startOffset =
			startIndex + match.index + node.position.start.offset;
		const endOffset = startOffset + match[0].length;

		if (isEscaped(docText, startOffset)) {
			startIndex += match.index + match[0].length;
			continue;
		}

		/*
		 * Find the matching opening bracket, ignoring escaped brackets.
		 */
		const openBracketIndex = findOpeningBracket(docText, startOffset);

		if (openBracketIndex === -1) {
			startIndex += match.index + match[0].length;
			continue;
		}

		/*
		 * Note: `label` can contain leading and trailing newlines, so we need to
		 * take that into account when calculating the line and column offsets.
		 */
		const label = docText.slice(openBracketIndex + 1, startOffset);

		invalid.push({
			label: label.trim(),
			position: {
				start: sourceCode.getLocFromIndex(startOffset + 1),
				end: sourceCode.getLocFromIndex(endOffset),
			},
		});

		startIndex += match.index + match[0].length;
	}

	return invalid;
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default /** @satisfies {NoInvalidLabelRefsRuleDefinition} */ ({
	meta: {
		type: "problem",
		languages: ["markdown/commonmark", "markdown/gfm"],

		docs: {
			recommended: true,
			description: "Disallow invalid label references",
			dialects: ["CommonMark", "GFM"],
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-invalid-label-refs.md",
		},

		messages: {
			invalidLabelRef:
				"Label reference '{{label}}' is invalid due to white space between [ and ].",
		},
	},

	create(context) {
		const { sourceCode } = context;

		return {
			text(node) {
				const invalidReferences = findInvalidLabelReferences(
					node,
					sourceCode,
				);

				for (const invalidReference of invalidReferences) {
					context.report({
						loc: invalidReference.position,
						messageId: "invalidLabelRef",
						data: {
							label: invalidReference.label,
						},
					});
				}
			},
		};
	},
});
