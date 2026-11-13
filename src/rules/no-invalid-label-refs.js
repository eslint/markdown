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
 * @import { Node, Text } from "mdast";
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
 * Checks whether the character at the given offset is escaped.
 * @param {string} text The source text.
 * @param {number} index The character offset.
 * @returns {boolean} Whether an odd number of backslashes precedes the character.
 */
function isEscaped(text, index) {
	let count = 0;

	for (let i = index - 1; i >= 0 && text[i] === "\\"; i--) {
		count++;
	}

	return count % 2 === 1;
}

/**
 * Checks whether an offset falls within syntax whose brackets
 * should not affect Markdown link-text matching.
 * @param {Node} node The Markdown AST node to check.
 * @param {number} offset The source offset.
 * @param {string} text The full source text.
 * @returns {boolean} Whether the offset should be ignored.
 */
function isInsideIgnoredSyntax(node, offset, text) {
	const start = node.position?.start?.offset;
	const end = node.position?.end?.offset;

	if (
		start === undefined ||
		end === undefined ||
		offset < start ||
		offset >= end
	) {
		return false;
	}

	const isIgnoredNode = node.type === "inlineCode" || node.type === "html";
	const isAutolink = node.type === "link" && text[start] === "<";

	if (isIgnoredNode || isAutolink) {
		return true;
	}

	if ("children" in node && Array.isArray(node.children)) {
		return node.children.some(child =>
			isInsideIgnoredSyntax(child, offset, text),
		);
	}

	return false;
}

/**
 * Finds the opening bracket for a potential invalid shorthand reference.
 * @param {string} text The source text.
 * @param {number} closingIndex The closing bracket offset.
 * @param {number} scopeStart The enclosing Markdown block's start offset.
 * @param {Node} container The enclosing Markdown AST node.
 * @returns {number} The opening bracket offset, or -1.
 */
function findOpeningBracket(text, closingIndex, scopeStart, container) {
	let depth = 0;

	for (let i = closingIndex - 1; i >= scopeStart; i--) {
		const char = text[i];

		if (char !== "[" && char !== "]") {
			continue;
		}

		if (isEscaped(text, i) || isInsideIgnoredSyntax(container, i, text)) {
			continue;
		}

		if (char === "]") {
			depth++;
		} else if (depth > 0) {
			depth--;
		} else {
			return i;
		}
	}

	return -1;
}

/**
 * Finds invalid label references in a node.
 * @param {Text} node The node to check.
 * @param {MarkdownSourceCode} sourceCode The Markdown source code object.
 * @returns {Array<{label:string,position:Position}>} The invalid references.
 */
function findInvalidLabelReferences(node, sourceCode) {
	const nodeText = sourceCode.getText(node);
	const docText = sourceCode.text;
	const invalid = [];
	let startIndex = 0;

	// Prevent a closing bracket in one block from matching an opening bracket
	// in a preceding paragraph, heading, or table cell.
	let container = sourceCode.getParent(node);

	while (
		container &&
		!["paragraph", "heading", "tableCell"].includes(container.type)
	) {
		container = sourceCode.getParent(container);
	}

	const scopeStart = container?.position?.start.offset ?? 0;

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

		// Ignore escaped closing brackets.
		if (isEscaped(docText, startOffset)) {
			startIndex += match.index + match[0].length;
			continue;
		}

		/*
		 * Search the entire document text to find the preceding open bracket.
		 */
		const lastOpenBracketIndex = findOpeningBracket(
			docText,
			startOffset,
			scopeStart,
			container ?? sourceCode.ast,
		);

		if (lastOpenBracketIndex === -1) {
			startIndex += match.index + match[0].length;
			continue;
		}

		/*
		 * Note: `label` can contain leading and trailing newlines, so we need to
		 * take that into account when calculating the line and column offsets.
		 */
		const label = docText.slice(lastOpenBracketIndex + 1, startOffset);

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
