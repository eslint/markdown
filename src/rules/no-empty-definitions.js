/**
 * @fileoverview Rule to prevent empty definitions in Markdown.
 * @author Pixel998
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: [{ checkFootnoteDefinitions?: boolean; }] }>}
 * NoEmptyDefinitionsRuleDefinition
 */

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
				if (checkFootnoteDefinitions && node.children.length === 0) {
					context.report({
						loc: node.position,
						messageId: "emptyFootnoteDefinition",
					});
				}
			},
		};
	},
};
