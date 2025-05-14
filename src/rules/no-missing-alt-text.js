/**
 * @fileoverview Rule to prevent images without an alternative text in Markdown.
 * @author Pixel998
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { findOffsets } from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: []; }>}
 * NoMissingAltTextRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const imgTagPattern = /<img[^>]*>/giu;

/**
 * Creates a regex to match HTML attributes
 * @param {string} name The attribute name to match
 * @returns {RegExp} Regular expression for matching the attribute
 */
function getHtmlAttributeRe(name) {
	return new RegExp(`\\s${name}(?:\\s*=\\s*['"]([^'"]*)['"])?`, "iu");
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoMissingAltTextRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow images without an alternative text",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-missing-alt-text.md",
		},

		messages: {
			missingAltText: "Missing alternative text for image.",
		},
	},

	create(context) {
		return {
			image(node) {
				if (node.alt.trim().length === 0) {
					context.report({
						loc: node.position,
						messageId: "missingAltText",
					});
				}
			},

			imageReference(node) {
				if (node.alt.trim().length === 0) {
					context.report({
						loc: node.position,
						messageId: "missingAltText",
					});
				}
			},

			html(node) {
				let match;

				while ((match = imgTagPattern.exec(node.value)) !== null) {
					const imgTag = match[0];
					const ariaHiddenMatch = imgTag.match(
						getHtmlAttributeRe("aria-hidden"),
					);
					if (
						ariaHiddenMatch &&
						ariaHiddenMatch[1].toLowerCase() === "true"
					) {
						continue;
					}

					const altMatch = imgTag.match(getHtmlAttributeRe("alt"));
					if (
						!altMatch ||
						(altMatch[1] &&
							altMatch[1].trim().length === 0 &&
							altMatch[1].length > 0)
					) {
						const {
							lineOffset: startLineOffset,
							columnOffset: startColumnOffset,
						} = findOffsets(node.value, match.index);

						const {
							lineOffset: endLineOffset,
							columnOffset: endColumnOffset,
						} = findOffsets(
							node.value,
							match.index + imgTag.length,
						);

						const nodeStartLine = node.position.start.line;
						const nodeStartColumn = node.position.start.column;
						const startLine = nodeStartLine + startLineOffset;
						const endLine = nodeStartLine + endLineOffset;
						const startColumn =
							(startLine === nodeStartLine
								? nodeStartColumn
								: 1) + startColumnOffset;
						const endColumn =
							(endLine === nodeStartLine ? nodeStartColumn : 1) +
							endColumnOffset;

						context.report({
							loc: {
								start: {
									line: startLine,
									column: startColumn,
								},
								end: {
									line: endLine,
									column: endColumn,
								},
							},
							messageId: "missingAltText",
						});
					}
				}
			},
		};
	},
};
