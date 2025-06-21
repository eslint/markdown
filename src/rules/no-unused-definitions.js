/**
 * @fileoverview Rule to prevent unused definitions in Markdown.
 * @author 루밀LuMir(lumirlumir)
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"unusedDefinition" | "unusedFootnoteDefinition"} NoUnusedDefinitionsMessageIds
 * @typedef {[{ allowDefinitions?: string[], allowFootnoteDefinitions?: string[]; }]} NoUnusedDefinitionsOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoUnusedDefinitionsOptions, MessageIds: NoUnusedDefinitionsMessageIds }>} NoUnusedDefinitionsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoUnusedDefinitionsRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow unused definitions",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-unused-definitions.md",
		},

		messages: {
			unusedDefinition:
				"Unexpected unused definition `{{ identifier }}` found.",
			unusedFootnoteDefinition:
				"Unexpected unused footnote definition `{{ identifier }}` found.",
		},

		schema: [
			{
				type: "object",
				properties: {
					allowDefinitions: {
						type: "array",
						items: {
							type: "string",
						},
						uniqueItems: true,
					},
					allowFootnoteDefinitions: {
						type: "array",
						items: {
							type: "string",
						},
						uniqueItems: true,
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{
				allowDefinitions: ["//"],
				allowFootnoteDefinitions: [],
			},
		],
	},

	create(context) {
		return {
			definition(node) {
				context.report({
					node,
					messageId: "unusedDefinition",
					data: { identifier: node.identifier },
				});
			},

			footnoteDefinition(node) {
				context.report({
					node,
					messageId: "unusedFootnoteDefinition",
					data: { identifier: node.identifier },
				});
			},
		};
	},
};
