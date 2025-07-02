/**
 * @fileoverview Rule to prevent empty definitions in Markdown.
 * @author Pixel998
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"emptyDefinition" | "emptyFootnoteDefinition"} NoEmptyDefinitionsMessageIds
 * @typedef {[{ checkFootnoteDefinitions?: boolean }]} NoEmptyDefinitionsOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoEmptyDefinitionsOptions, MessageIds: NoEmptyDefinitionsMessageIds }>} NoEmptyDefinitionsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const htmlCommentPattern = /<!--[\s\S]*?-->/gu;

/**
 * Checks if a string contains only HTML comments.
 * @param {string} value The input string to check.
 * @returns {boolean} True if the string contains only HTML comments, false otherwise.
 */
function isOnlyComments(value) {
	const withoutComments = value.replace(htmlCommentPattern, "");

	return withoutComments.trim().length === 0;
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoEmptyDefinitionsRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow empty definitions",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-empty-definitions.md",
		},

		messages: {
			emptyDefinition: "Unexpected empty definition found.",
			emptyFootnoteDefinition:
				"Unexpected empty footnote definition found.",
		},

		schema: [
			{
				type: "object",
				properties: {
					checkFootnoteDefinitions: {
						type: "boolean",
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [{ checkFootnoteDefinitions: true }],
	},

	create(context) {
		const [{ checkFootnoteDefinitions }] = context.options;

		return {
			definition(node) {
				if (!node.url || node.url === "#") {
					context.report({
						loc: node.position,
						messageId: "emptyDefinition",
					});
				}
			},

			footnoteDefinition(node) {
				if (
					checkFootnoteDefinitions &&
					(node.children.length === 0 ||
						node.children.every(
							child =>
								child.type === "html" &&
								isOnlyComments(child.value),
						))
				) {
					context.report({
						loc: node.position,
						messageId: "emptyFootnoteDefinition",
					});
				}
			},
		};
	},
};
