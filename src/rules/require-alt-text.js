/**
 * @fileoverview Rule to require alternative text for images in Markdown.
 * @author Pixel998
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { ELEMENT_NODE, parse, walkSync } from "ultrahtml";
import { findOffsets } from "../util.js";

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
				const ast = parse(node.value);

				walkSync(ast, htmlNode => {
					if (
						htmlNode.type === ELEMENT_NODE &&
						htmlNode.name.toLowerCase() === "img"
					) {
						let altValue;
						let ariaHiddenValue;

						for (const [
							attributeName,
							attributeValue,
						] of Object.entries(htmlNode.attributes)) {
							if (attributeName.toLowerCase() === "alt") {
								altValue = attributeValue;
							} else if (
								attributeName.toLowerCase() === "aria-hidden"
							) {
								ariaHiddenValue = attributeValue;
								if (ariaHiddenValue.toLowerCase() === "true") {
									return;
								}
							}

							if (
								altValue !== undefined &&
								ariaHiddenValue !== undefined
							) {
								break;
							}
						}

						if (
							altValue === undefined ||
							(altValue.trim().length === 0 &&
								altValue.length > 0)
						) {
							const startOffset = htmlNode.loc[0].start;
							const endOffset = htmlNode.loc[1].end;

							const {
								lineOffset: startLineOffset,
								columnOffset: startColumnOffset,
							} = findOffsets(node.value, startOffset);

							const {
								lineOffset: endLineOffset,
								columnOffset: endColumnOffset,
							} = findOffsets(node.value, endOffset);

							const nodeStartLine = node.position.start.line;
							const nodeStartColumn = node.position.start.column;
							const startLine = nodeStartLine + startLineOffset;
							const endLine = nodeStartLine + endLineOffset;
							const startColumn =
								(startLine === nodeStartLine
									? nodeStartColumn
									: 1) + startColumnOffset;
							const endColumn =
								(endLine === nodeStartLine
									? nodeStartColumn
									: 1) + endColumnOffset;

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
				});
			},
		};
	},
};
