/**
 * @fileoverview Rule to require alternative text for images in Markdown.
 * @author Pixel998
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { findOffsets, stripHtmlComments } from "../util.js"; // TODO

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"altTextRequired"} RequireAltTextMessageIds
 * @typedef {[]} RequireAltTextOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: RequireAltTextOptions, MessageIds: RequireAltTextMessageIds }>} RequireAltTextRuleDefinition
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

/** @type {RequireAltTextRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Require alternative text for images",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/require-alt-text.md",
		},

		messages: {
			altTextRequired: "Alternative text for image is required.",
		},
	},

	create(context) {
		return {
			image(node) {
				if (node.alt.trim().length === 0) {
					context.report({
						loc: node.position,
						messageId: "altTextRequired",
					});
				}
			},

			imageReference(node) {
				if (node.alt.trim().length === 0) {
					context.report({
						loc: node.position,
						messageId: "altTextRequired",
					});
				}
			},

			html(node) {
				const text = stripHtmlComments(node.value);

				let match;
				while ((match = imgTagPattern.exec(text)) !== null) {
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
						} = findOffsets(node.value, match.index); // TODO

						const {
							lineOffset: endLineOffset,
							columnOffset: endColumnOffset,
						} = findOffsets(
							node.value,
							match.index + imgTag.length,
						); // TODO

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
							messageId: "altTextRequired",
						});
					}
				}
			},
		};
	},
};
