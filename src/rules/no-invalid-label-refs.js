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

		/*
		 * Search the entire document text to find the preceding open bracket.
		 */
		const lastOpenBracketIndex = docText.lastIndexOf("[", startOffset);

		if (lastOpenBracketIndex === -1) {
			startIndex += match.index + match[0].length;
			continue;
		}

		/*
		 * Note: `label` can contain leading and trailing newlines, so we need to
		 * take that into account when calculating the line and column offsets.
		 */
		const label = docText
			.slice(lastOpenBracketIndex, endOffset)
			.match(/!?\[([^\]]+)\]/u)[1];

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

/** @type {NoInvalidLabelRefsRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow invalid label references",
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
				if (!node.position) {
					return;
				}

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
};
