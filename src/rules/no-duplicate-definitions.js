/**
 * @fileoverview Rule to prevent duplicate definitions in Markdown.
 * @author 루밀LuMir(lumirlumir)
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"duplicateDefinition" | "duplicateFootnoteDefinition"} NoDuplicateDefinitionsMessageIds
 * @typedef {[{ allowDefinitions: string[], allowFootnoteDefinitions: string[]; }]} NoDuplicateDefinitionsOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoDuplicateDefinitionsOptions, MessageIds: NoDuplicateDefinitionsMessageIds }>} NoDuplicateDefinitionsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoDuplicateDefinitionsRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow duplicate definitions",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-duplicate-definitions.md",
		},

		messages: {
			duplicateDefinition: "Unexpected duplicate definition found.",
			duplicateFootnoteDefinition:
				"Unexpected duplicate footnote definition found.",
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
		const allowDefinitions = new Set(context.options[0]?.allowDefinitions);
		const allowFootnoteDefinitions = new Set(
			context.options[0]?.allowFootnoteDefinitions,
		);

		const definitions = new Set();
		const footnoteDefinitions = new Set();

		return {
			definition(node) {
				if (allowDefinitions.has(node.identifier)) {
					return;
				}

				if (definitions.has(node.identifier)) {
					context.report({
						node,
						messageId: "duplicateDefinition",
					});
				} else {
					definitions.add(node.identifier);
				}
			},

			footnoteDefinition(node) {
				if (allowFootnoteDefinitions.has(node.identifier)) {
					return;
				}

				if (footnoteDefinitions.has(node.identifier)) {
					context.report({
						node,
						messageId: "duplicateFootnoteDefinition",
					});
				} else {
					footnoteDefinitions.add(node.identifier);
				}
			},
		};
	},
};
